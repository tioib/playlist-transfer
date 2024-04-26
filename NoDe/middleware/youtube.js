const axios = require('axios');
const auth = require("./auth");

exports.getPlaylists = async function(req,res)
{
    const list = [];
    let next = "https://www.googleapis.com/youtube/v3/playlists?mine=true&part=contentDetails,id,localizations,snippet,status&maxResults=50";
    do
    {
        axios.get(next,{},
        {
            headers: {
                Authorization: 'Bearer '+ await auth.getToken(true)
            }
        }).then((response)=>
        {
            next = response.data.nextPageToken ? "https://www.googleapis.com/youtube/v3/playlists?mine=true&part=contentDetails,id,localizations,snippet,status&maxResults=50&pageToken="+response.data.nextPageToken : "";
            list.concat(response.data.items);
        }).catch((error)=>{console.log("GET SF PLAYLISTS ERROR: ",req.session.user, error); res.status(404).json(error)});
    }while(next !== "");

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
    next = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${list.id}&part=contentDetails,id,snippet,status&maxResults=50`;
    do
    {
        axios.get(next,{},
        {
            headers: {
                Authorization: 'Bearer '+ await auth.getToken(req,true)
            }
        }).then((response)=>
        {   
            if(response.status === 200)
            {
                next = response.data.nextPageToken ? `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${list.id}&part=contentDetails,id,snippet,status&maxResults=50&pageToken=${response.data.nextPageToken}` : "";
                result[i].tracks.concat(response.data.items);   
            }
            else
            {
                res.status(response.status).json(response.data);
                return 0;
            }
        }).catch((error)=>{console.log("GET SF PL ITEMS ERROR: ",req.session.user, error); res.status(404).json(error)});
    }while(next !== null)

    return result;
}

async function search(req,item)
{
    axios.get(`https://www.googleapis.com/youtube/v3/search?q=${item}&part=snippet&type=video&maxResults=50`,{},
    {
        headers: {
            Authorization: 'Bearer '+ await auth.getToken(true)
        }
    }).then((response)=>
    {
        if(response.status === 403)
        {
            res.status(403).json(response.data);
            return 0;
        }
        else if(response.status === 200) return response.data;
    }).catch((error)=>{console.log("YT SEARCH ERROR: ",req.session.user, error); res.status(404).json(error)});
}

exports.generatePlaylist = async function(req,res)
{
    const sList = req.body.list;
    let val = false;
    axios.post(
        `https://www.googleapis.com/youtube/v3/playlists?part=id,snippet,status`,
        {
            "snippet": 
            {
                "title": req.body.name,
                "description": req.body.description,
            },
            "status":
            {
                "privacyStatus": req.body.public
            }
        },
        {
            headers: {
                Authorization: 'Bearer '+ await auth.getToken(req,true)
            }
        }).then(async (response)=>{
        if(response.status === 201)
        {
            const newPlaylist = response.data, newTracks = [];
            sList.tracks.forEach(async sTrack => {
                let ytTrackList = await search( //perform the search
                    req,
                    sTrack.snippet.title + " " + sTrack.snippet.videoOwnerChannelTitle //search on spotify with youtube's video title and uploader channel title (subject to change)
                );

                if(ytTrackList === 0)
                {
                    val = true; return;
                }

                if(ytTrackList.pageInfo.totalResults !== 0)
                {
                    let points = {item:{},points:0}; //gathers the points for each result (the track/episode with the most points will be added to the playlist)
                    points = await calculatePoints(ytTrackList.items,points,sTrack);
                    let track = await addTrack(req,res,{playlist:newPlaylist.id,video:points.item.id});
                    if(track === 0) return;
                    else newTracks.push(track);
                }
            });

            if(val) return;

            try
            {
                const SavePlaylist = require("../controllers/playlists");
                await SavePlaylist.createSavedPlaylist(
                    {
                        yt_id: newPlaylist.id,
                        s_id: sList.list.id,
                        yt_user: req.session.user.yt_id,
                        s_user: req.session.user.s_id,
                        yt_tracks: newTracks,
                        s_tracks: sList.tracks,
                        yt_title: req.body.name,
                        s_title: sList.list.name,
                        yt_desc: req.body.description,
                        s_desc: sList.list.description,
                        yt_privacy: req.body.public,
                        s_privacy: sList.list.public,
                        link_title: req.query.title,
                        link_desc: req.query.desc,
                        link_privacy: req.query.privacy,
                        s_privacy_if_unlisted: req.query.privIfUn,
                    }
                )

                res.status(200);
            }catch(error){console.log("SF ADD PL TO DB ERROR: ",req.session.user, error); res.status(500).json(error)}
        }else res.status(response.status).json(response.data);
    }).catch((error)=>{console.log("SF CREATE PL ERROR: ",req.session.user, error); res.status(404).json(error)});
}

async function calculatePoints(search,sTrack)
{
    const points = {item:{},points:0};
    const logic = require("./playlist_logic");
    for(let i = 0; i < search.length; i++)
    {
        let result = logic.calculatePoints(sTrack,search[i].snippet);
        if(result > points.points)
        {
            points.points = result;
            points.item = search[i];
        }  
    }

    return points;
}

async function addTrack(req,res,ids)
{
    axios.post( //add the tracks
        `https://www.googleapis.com/youtube/v3/playlistItems?part=id,snippet`,
        {
            "snippet":
            {
                "playlistId": ids.playlist,
                "resourceId":
                {
                    "kind": "youtube#video",
                    "videoId": ids.video
                }
            }
        },
        {
            headers: {
                Authorization: 'Bearer '+ await auth.getToken(req,true)
            }
        }).then(async (response)=>
        {
            if(response.status === 200) return response.data;
            else{ res.status(response.status).json(response.data); return 0};
        }).catch((error)=>{console.log("YT ADD TRACK TO PL ERROR: ",req.session.user, error); res.status(404).json(error)});
}