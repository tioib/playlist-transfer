//TO CONSIDER: replace "ytTrack." for "ytTrack.snippet."

exports.calculatePoints = function(sTrack,ytTrack)
{
    result = 0;
    if(sTrack.type === "track")
    {
        if(checkFullAlbum(sTrack,ytTrack)) return -1;
        
        /* TODO
            FOR LATER: check if youtube video is static (not music video)
        */

        if(compare(ytTrack.title, sTrack.name)) result++; //yt title contains s track name 
        if(compare(ytTrack.description, sTrack.album.name)) result++; //yt desc contains album name
        sTrack.artists.forEach((artist)=>
        {
            if(ytTrack.videoOwnerChannelTitle === `${sTrack.artist.name} - Topic` && ytTrack.title === sTrack.name) return 10; //channel name contains " - Topic"
            if(compare(ytTrack.title, sTrack.name) && compare(ytTrack.title, artist.name)) result++; //yt tite contains s track name and artist name
            if(compare(ytTrack.title, sTrack.name) && compare(ytTrack.title, artist.name) && compare(ytTrack.title, sTrack.album.name)) result++; //yt title contains s track name and artist name and album name
            if(compare(ytTrack.videoOwnerChannelTitle, artist.name) || compare(ytTrack.videoOwnerChannelTitle, artist.name.replace(/\\s+/g, ''))) result++; //channel name contains artist name 
        });
        
    }
    else //if s track is episode: check word coincidence, each word 1 point
    {
        sTrack.name.split(" ").forEach((word)=>
        {
            if(word !== "—" && word !== "-")
            {
                if(compare(ytTrack.title, word)) result++;
            }
        });
    }

    return result;
}

function checkFullAlbum(sTrack,ytTrack)
{
    const possibilities = ["full album","fullalbum","full ep","fullep","full demo","fulldemo","full mixtape","fullmixtape"];
    let ytContains = sContains = false;
    possibilities.forEach((i)=>{
        sContains = compare(sTrack.name,i);
        ytContains = compare(ytTrack.title,i);
    });
    return !sContains && ytContains;
}

function compare(a,b)
{
    return a.toLowerCase().includes(b.toLowerCase());
}