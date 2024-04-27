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

exports.refreshYoutube = async function(req)
{
    try{
        axios.post(
            "https://oauth2.googleapis.com/token",
            {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "refresh_token",
                refresh_token: req.session.user.yt_refresh
            }
        ).then(async function(response)
        {
            if(response.data.refresh_token) 
            {
                req.session.user.yt_refresh = response.data.refresh_token;
                await user.save();
            }
            req.session.ytToken = response.data.access_token;
            return response.data;
        });
    }catch(error){console.log(error); res.send(error)}
}

exports.refreshSpotify = async function(req)
{
    try{
        axios.post(
            "https://accounts.spotify.com/api/token",
            {
                grant_type: 'refresh_token',
                refresh_token: req.session.user.s_refresh,
                client_id: sId
            },
            {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
                }
            }
        ).then(async function(response)
        {
            req.session.user.s_refresh = response.data.refresh_token;
            await user.save();
            req.session.sToken = response.data.access_token;
            return response.data;
        });
    }catch(error){console.log(error); res.send(error)}
}

exports.sendYoutubeLink = async (req, res) =>
{
    if(req.session.sToken && req.session.user.yt_refresh)
    {
        const tokens = await refreshYoutube(req);
        req.session.ytInterval = setInterval(()=>req.session.ytToken = "",(tokens.expires_in - 60)*1000);
        res.status(204);
    }
    else
    //this should be the right way to send it but google is a bitch
    //res.json(sendYoutubeLinkButCorrectly());
    res.status(200).json(ytLink);
}

exports.sendSpotifyLink = async (req, res) =>
{
    if(req.session.ytToken && req.session.user.s_refresh)
    {
        const tokens = await refreshSpotify(req);
        req.session.sInterval = setInterval(()=>req.session.sToken = "",(tokens.expires_in - 60)*1000);
        res.status(204);
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
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirect
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
                    if(req.session.sToken) //if already logged in with spotify
                    {
                        if(!req.session.user.yt_id) //has never logged in with yt before
                            req.session.user.yt_id = response.data.items[0].id; //save youtube id for later
                        //save refresh token and update db
                        req.session.user.yt_refresh = tokens.refresh_token;
                        await req.session.user.save();
                    }
                    else 
                    {  
                        user = await User.getUserFromYtId(response.data.items[0].id); //search for user with yt id
                        if(Object.keys(user).length == 0) user = await User.createUser( //condition means it's the first time the user logs in, so create user
                        {
                            yt_id: req.session.ytId, 
                            yt_refresh: tokens.refresh_token
                        });
                        else user.yt_refresh = tokens.refresh_token; //else save new refresh token
                        await user.save();
                    }    
                    req.session.ytToken = tokens.access_token;
                    req.session.user = user;
                    req.session.ytInterval = setInterval(()=>req.session.ytToken = "",(tokens.expires_in - 60)*1000);
                })
        })
    }catch(error){console.log(error);res.send(error)}
}

exports.setSpotifyToken = async (req,res) =>
{
    try{
        if(req.query.code) axios.post(
            "https://accounts.spotify.com/api/token",
            {
                code: req.query.code,
                redirect: sRedirect,
                grant_type: 'authorization_code'
            },
            {
                headers:{
                    'content-type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
                }
            }
        ).then(async function(response)
        {
            const tokens = response.data;
            axios.get("https://api.spotify.com/v1/me",{},
            {
                headers: {
                    Authorization: 'Bearer '+response.data.access_token
                }
            }).then(async (response)=>
                {
                
                    if(req.session.ytToken)
                    {
                        if(!session.user.sId)
                            req.session.user.sId = response.data.id

                        req.session.user.s_refresh = tokens.refresh_token;
                        await req.session.user.save();
                    }
                    else
                    {
                        user = await User.getUserFromSId(response.data.id); 
                        if(Object.keys(user).length == 0) user = await User.createUser( 
                            {
                                s_id: req.session.ytId, 
                                s_refresh: tokens.refresh_token
                            });
                        else user.s_refresh = tokens.refresh_token;
                        await user.save();
                    }
                    req.session.sToken = tokens.access_token;
                    req.session.user = user;
                    req.session.sInterval = setInterval(()=>req.session.sToken = "",(tokens.expires_in - 60)*1000);
                });
        });
    }catch(error){console.log(error);res.send(error);}
}

exports.confirmTokens = function(req, res)
{
    if(req.session.ytToken && req.session.sToken) res.status(200);
    else res.status(204);
}

exports.logout = function(req,res)
{
    clearInterval(req.session.ytInterval);
    clearInterval(req.session.sInterval);
    req.session.destroy();
    res.status(200);
}

exports.unlink = async function(req,res)
{
    try{
        User.deleteUser(req.session.user._id).then(function()
        {
            if(req.query.which)//true: deleted youtube, false: deleted spotify
                User.createUser({
                    s_id: req.session.user.s_id,
                    s_refresh: req.session.user.s_refresh
                });
            else 
                User.createUser({
                    yt_id: req.session.user.yt_id,
                    yt_refresh: req.session.user.yt_refresh
                });

            this.logout(req,res);
        });
    }catch(error){console.log(error);res.send(error);}
    
}

exports.getToken = async function(req,which)
{
    if(which) //youtube
        return req.session.ytToken === "" ? (await refreshYoutube(req)).auth_token : req.session.sToken
        
    return req.session.sToken === "" ? (await refreshSpotify(req)).auth_token : req.session.sToken;
}