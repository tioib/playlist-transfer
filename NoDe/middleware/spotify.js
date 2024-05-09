//TODO: SAVE GENERATED PLAYLISTS TO DB, REMEMBER ERROR HANDLING. ADD ERROR HANDLING TO generatePlaylist

const axios = require('axios');
const auth = require("./auth");

exports.getPlaylists = async function(req,res)
{
    const list = [];
    let next = "https://api.spotify.com/v1/me/playlists";
    do
    {
        axios.get(next,
        {
            headers: {
                Authorization: 'Bearer '+ await auth.getToken(req,false)
            }
        }).then((response)=>
        {
            if(response.status === 200)
            {
                next = response.data.next;
                list.concat(
                response.data.items.filter((playlist)=>
                playlist.owner.id == req.session.sId));
            }
            else
            {
                res.status(response.status).json(response.data);
                return;
            }
            
        }).catch((error)=>{console.log("GET SF PLAYLISTS ERROR: ", error); res.status(404).json(error)});
    }while(next !== null);

    const arr = [];
    for(let i = 0; i < list.length; i++)
    {
        let result = getTracks(list[i],req,res);
        if(result === 0) return;
        else arr.push(result);
    }

    res.status(200).json(arr);
}

async function getTracks(list,req,res)
{
    const result = {playlist:list,tracks:[]};
    let flag = true;
    next = `https://api.spotify.com/v1/playlists/${list.id}/tracks`;
    do
    {
        axios.get(next,
        {
            headers: {
                Authorization: 'Bearer '+ await auth.getToken(req,false)
            }
        }).then((response)=>
        {   
            if(response.status === 200)
            {
                next = response.data.next;
                result[i].tracks.concat(response.data.items);   
            }
            else
            {
                res.status(response.status).json(response.data);
                flag = false;
            }
        }).catch((error)=>{console.log("GET SF PL ITEMS ERROR: ", error); res.status(404).json(error)});
    }while(next !== null && flag)

    return result;
}

async function search(req,item)
{
    axios.get(`https://api.spotify.com/v1/search?q=${item}&type=track,episode&limit=50`,
    {
        headers: {
            Authorization: 'Bearer '+ await auth.getToken(req,false)
        }
    }).then((response)=>
    {
        return response.data;
    }).catch((error)=>{console.log("SF SEARCH ERROR: ", error); res.status(404).json(error)});
}

exports.generatePlaylist = async function(req,res)
{
    const ytList = req.body.list;

    axios.post(
        `https://api.spotify.com/v1/users/${req.session.sId}/playlists`,
        {
            "name": req.body.name,
            "description": req.body.description,
            "public": req.body.public
        },
        {
            headers: {
                Authorization: 'Bearer '+ await auth.getToken(req,false)
            }
        }).then(async (response)=>{
        if(response.status === 201)
        {
            const newPlaylist = response.data, newTracks = [];
            const uris = []; //array of the track ids in the format the request needs for the tracks to be added to the playlist
            ytList.tracks.forEach(async ytTrack => {
                let sTrackList = await search( //perform the search
                    req,
                    ytTrack.snippet.title + " " + ytTrack.snippet.videoOwnerChannelTitle //search on spotify with youtube's video title and uploader channel title (subject to change)
                );

                let points = {track: {item:{},points:0}, episode: {item:{},points:0}}; //gathers the points for each result (the track/episode with the most points will be added to the playlist)
                let calcTracks = sTrackList.tracks.total > 0, calcEpisodes = sTrackList.episodes.total > 0;
                //calcTracks: if tracks should be calculated. if no tracks were found then they shouldn't be
                //calcEpisodes: if episodes should be calculated. same as with the tracks
                
                if(calcTracks)
                {
                    points.track = await calculatePoints(sTrackList.tracks.items,ytTrack)
                    calcEpisodes = calcEpisodes && points.track.points < 3; //if episodes were found but the top track has > 2 points, don't bother with the episodes
                }

                if(calcEpisodes) //if they need to be calculated cause they were found and the top track has < 3 points
                {
                    points.episode = await calculatePoints(sTrackList.episodes.items,ytTrack)
                    //if the top episode has at least 2 points, or there were no tracks found, add the episode to the playlist, else just add the top track
                    if(points.episode.points > 1 || !calcTracks)
                    {
                        uris.push("spotify:episode:"+points.episode.item.id);
                        newTracks.push(points.episode.item);
                    }
                    else
                    {
                        uris.push("spotify:track:"+points.track.item.id);
                        newTracks.push(points.track.item);
                    }
                }
                else if(calcTracks)
                {
                    uris.push("spotify:track:"+points.track.item.id); //else if tracks were found then add the top track
                    newTracks.push(points.track.item);
                }
            });

            if(uris.length > 0) //if at least 1 track found
            {
                axios.post( //add the tracks
                `https://api.spotify.com/v1/playlists/${newPlaylist.id}/tracks`,
                {"uris": uris},
                {
                    headers: {
                        Authorization: 'Bearer '+ await auth.getToken(req,false)
                    }
                }).then(async (response)=>
                {
                    if(response.status === 200)
                    {
                        try
                        {
                            const SavePlaylist = require("../controllers/playlists");
                            await SavePlaylist.createSavedPlaylist(
                                {
                                    yt_id: ytList.list.id,
                                    s_id: newPlaylist.id,
                                    yt_user: req.session.ytId,
                                    s_user: req.session.sId,
                                    yt_tracks: ytList.tracks,
                                    s_tracks: newTracks,
                                    yt_title: ytList.list.snippet.title,
                                    s_title: req.body.name,
                                    yt_desc: ytList.list.description,
                                    s_desc: req.body.description,
                                    yt_privacy: ytList.list.status.privacyStatus,
                                    s_privacy: req.body.public,
                                    link_title: req.query.title,
                                    link_desc: req.query.desc,
                                    link_privacy: req.query.privacy,
                                    s_privacy_if_unlisted: req.query.privIfUn,
                                }
                            )

                            res.status(200);
                        }catch(error){console.log("SF ADD PL TO DB ERROR: ", error); res.status(500).json(error)}
                    }
                    else{ res.status(response.status).json(response.data)};
                }).catch((error)=>{console.log("SF ADD TRACKS TO PL ERROR: ", error); res.status(404).json(error)});
            }else res.status(404).json("NO TRACKS ON SEARCH"); //no tracks were found at all
        }else res.status(response.status).json(response.data);
    }).catch((error)=>{console.log("SF CREATE PL ERROR: ", error); res.status(404).json(error)});
}

async function calculatePoints(search,ytTrack)
{
    const logic = require("./playlist_logic");
    const points = {item:{},points:0};
    for(let i = 0; i < search.length; i++)
    {
        let result = logic.calculatePoints(search[i],ytTrack.snippet);
        if(result > points.points)
        {
            points.points = result;
            points.item = search[i];
        }  
    }

    return points;
}