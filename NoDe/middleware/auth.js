require('dotenv').config({path: '../.env'});

const ytId = process.env.YT_ID, ytSecret = process.env.YT_SECRET, ytRedirect = process.env.YT_REDIRECT;
const ytLink = "https://accounts.google.com/o/oauth2/v2/auth?client_id="+ytId+"&redirect_uri="+ytRedirect+"&response_type=code&scope=https://www.googleapis.com/auth/youtube&include_granted_scopes=true&state=pass-through value&prompt=consent&access_type=offline";

const sId = process.env.S_ID, sSecret = process.env.S_SECRET, sRedirect = process.env.S_REDIRECT;
const sLink = "https://accounts.spotify.com/authorize?response_type=code&client_id="+sId+"&scope=playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-read-private ugc-image-upload&redirect_uri="+sRedirect;

const axios = require('axios');
const User = require('../controllers/user');

function sendYoutubeLinkButCorrectly() //gives auth error, converts spaces to %20's and google doesn't like that
{
    const {google} = require('googleapis');

    /**
     * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
     * from the client_secret.json file. To get these credentials for your application, visit
     * https://console.cloud.google.com/apis/credentials.
     */
    const oauth2Client = new google.auth.OAuth2(
        ytId,
        ytSecret,
        ytRedirect
    );

    // Access scopes for read-only Drive activity.
    const scopes = [
    'https://www.googleapis.com/auth/youtube'
    ];

    // Generate a url that asks permissions for the Drive activity scope
    const authorizationUrl = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        /** Pass in the scopes array defined above.
            * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
        scope: scopes,
        // Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes: true
    });
    
    return authorizationUrl;
}

const refreshYoutube = async function(user)
{
    try{
        const response = await axios.post(
            "https://oauth2.googleapis.com/token",
            {
                client_id: ytId,
                client_secret: ytSecret,
                grant_type: "refresh_token",
                refresh_token: user.yt_refresh
            }
        );

        user.yt_access = response.data.access_token;
        if(response.data.refresh_token) 
        {
            user.yt_refresh = response.data.refresh_token;
        }
        await user.save();
        return response.data;
    }catch(error){console.log(error)}
}

const refreshSpotify = async function(user)
{
    try{
        const response = await axios.post(
            "https://accounts.spotify.com/api/token",
            {
                grant_type: 'refresh_token',
                refresh_token: user.s_refresh,
                client_id: sId
            },
            {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + (new Buffer.from(sId + ':' + sSecret).toString('base64'))
                }
            }
        );
        user.s_access = response.data.access_token;
        user.s_refresh = response.data.refresh_token;
        await user.save();
        return response.data;

    }catch(error){console.log(error)}
}

exports.sendYoutubeLink = async (req, res) =>
{
    if(req.session.sId)
    {
        const user = await User.getUserFromSId(req.session.sId);
        if(user[0].yt_refresh !== undefined)
        {
            const tokens = await refreshYoutube(user[0]);
            user[0].yt_interval = setInterval(async ()=>await refreshYoutube(user), tokens.expires_in * 60 * 1000 - 60);
            await user[0].save();

            req.session.ytId = user[0].yt_id;

            res.status(200).send(true);
        }
        else res.status(200).json(ytLink);
    }
    else
    //this should be the right way to send it but google is a bitch
    //res.json(sendYoutubeLinkButCorrectly());
    res.status(200).json(ytLink);
}

exports.sendSpotifyLink = async (req, res) =>
{
    if(req.session.ytId)
    {
        const user = await User.getUserFromYtId(req.session.ytId);
        if(user[0].s_refresh !== undefined)
        {
            const tokens = await refreshSpotify(user[0]);
            user[0].s_interval = setInterval(async ()=>await refreshSpotify(user), tokens.expires_in * 60 * 1000 - 60);
            await user[0].save();

            req.session.sId = user[0].s_id;

            res.status(200).send(true);
        }
        else res.status(200).json(sLink);
    }
    else res.status(200).json(sLink);
}

exports.setYoutubeToken = async (req, res) =>
{
    try
    {
        if(req.query.code) axios.post(
            "https://accounts.google.com/o/oauth2/token",
            {
                grant_type: 'authorization_code',
                code: req.query.code,
                client_id: ytId,
                client_secret: ytSecret,
                redirect_uri: ytRedirect
            }).then((response)=>
            {
                const tokens = response.data;
                axios.get(
                    "https://www.googleapis.com/youtube/v3/channels?part=id&mine=true",
                    {
                        headers: {Authorization: `Bearer ${response.data.access_token}`}
                    }
                ).then(async function(response)
                {
                    let user = await User.getUserFromYtId(response.data.items[0].id); //search for user with yt id
                    const arrLen = Object.keys(user).length;

                    if(req.session.sId) //if already logged in with spotify
                    {
                        user = await User.getUserFromSId(req.session.sId);
                        if(user[0].yt_id === undefined) await User.deleteUserByYtId(response.data.items[0].id);

                        user[0].yt_id = response.data.id
                        user[0].yt_refresh = tokens.refresh_token;
                        user[0].yt_access = tokens.access_token;
                        user[0].yt_interval = setInterval(async ()=>await refreshYoutube(user[0]), tokens.expires_in * 60 * 1000 - 60);
                    
                        await user[0].save();
                    }
                    else 
                    {    
                        if(arrLen === 1)
                        {
                            user[0].yt_refresh = tokens.refresh_token; //else save new refresh token
                            user[0].yt_access = tokens.access_token;
                            user[0].yt_interval = setInterval(async ()=>await refreshYoutube(user[0]), tokens.expires_in * 60 * 1000 - 60);
                            await user[0].save();
                        }
                        else 
                        {
                            user = await User.createUser( //condition means it's the first time the user logs in, so create user
                            {
                                yt_id: response.data.items[0].id, 
                                yt_refresh: tokens.refresh_token,
                                yt_access: tokens.access_token,
                                yt_interval: setInterval(async ()=>await refreshYoutube(user), tokens.expires_in * 60 * 1000 - 60)
                            });
                            await user.save();
                        }
                    }
                    req.session.ytId = response.data.items[0].id;
                    res.send("<script>window.close();</script>");
                })
        })
    }catch(error){console.log(error);res.send(error)}
}

exports.setSpotifyToken = async (req,res) =>
{
    try{
         axios.post(
            "https://accounts.spotify.com/api/token",
            {
                code: req.query.code,
                redirect_uri: sRedirect,
                grant_type: 'authorization_code'
            },
            {
                headers:{
                    'content-type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + (new Buffer.from(sId + ':' + sSecret).toString('base64'))
                }
            }
        ).then(async function(response)
        {
            const tokens = response.data;

            axios.get("https://api.spotify.com/v1/me",
            {
                headers: {
                    Authorization: 'Bearer '+response.data.access_token
                }
            }).then(async (response)=>
                {
                    let user = await User.getUserFromSId(response.data.id); 
                    const arrLen = Object.keys(user).length;

                    if(req.session.ytId)
                    {
                        user = await User.getUserFromYtId(req.session.ytId);
                        if(user[0].s_id === undefined) await User.deleteUserBySId(response.data.id);

                        user[0].s_id = response.data.id
                        user[0].s_refresh = tokens.refresh_token;
                        user[0].s_access = tokens.access_token;
                        user[0].s_interval = setInterval(async ()=>await refreshSpotify(user[0]), tokens.expires_in * 60 * 1000 - 60);
                    
                        await user[0].save();
                    }
                    else
                    {
                        if(arrLen === 1)
                        {
                            user[0].s_refresh = tokens.refresh_token; //else save new refresh token
                            user[0].s_access = tokens.access_token;
                            user[0].s_interval = setInterval(async ()=>await refreshSpotify(user[0]), tokens.expires_in * 60 * 1000 - 60);
                            await user[0].save();
                        }
                        else
                        {
                            user = await User.createUser( //condition means it's the first time the user logs in, so create user
                            {
                                s_id: response.data.id, 
                                s_refresh: tokens.refresh_token,
                                s_access: tokens.access_token,
                                s_interval: setInterval(async ()=>await refreshSpotify(user), tokens.expires_in * 60 * 1000 - 60)
                            });
                            
                            await user.save();  
                        }
                    }
                    req.session.sId = response.data.id; 
                    res.send("<script>window.close()</script>");
                }).catch((error)=>{console.log(error)});
        });
    }catch(error){console.log(error);res.send(error);}
}

exports.confirmYoutube = async function(req, res)
{ //working only with status didn't work, it only returned status 204 even if configured on the server to return 200, this is the only thing that worked
    if(req.session.ytId)
        res.status(200).send(true);
    else
        res.status(200).send(false);
}

exports.confirmSpotify = async function(req, res)
{ //working only with the response status (without sending data) appeared to work with spotify but not with youtube, but i also changed this function anyway just in case
    if(req.session.sId) 
        res.status(200).send(true);
    else 
        res.status(200).send(false);
}

exports.logout = async function(req,res)
{
    const user = await User.getUserFromSId(req.session.sId);
    clearInterval(user[0].yt_interval);
    clearInterval(user[0].s_interval);
    req.session.destroy();
    res.status(200).send();
}

exports.unlink = async function(req,res)
{
    try{
        const user = await User.getUserFromSId(req.session.sId);
        await User.deleteUser(user._id).then(async function()
        {
            if(req.query.which)//true: deleted youtube, false: deleted spotify
                await User.createUser({
                    s_id: user.sid,
                    s_refresh: user.s_refresh
                });
            else 
                await User.createUser({
                    yt_id: user.yt_id,
                    yt_refresh: user.yt_refresh
                });

            this.logout(req,res);
        });
    }catch(error){console.log(error);res.send(error);}
    
}

exports.getToken = async function(req,which)
{
    const user = await User.getUserFromYtId(req.session.ytId);

    if(which)
        return user.yt_access; 

    return user.s_access; 
}