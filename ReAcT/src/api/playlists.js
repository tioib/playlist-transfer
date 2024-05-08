import axios from 'axios';
axios.defaults.withCredentials = true;

const BASE_URL = 'http://localhost:3002/';

export const getYoutubePlaylists = () =>
{
    return axios.get(`${BASE_URL}/yt/playlists`);
}

export const createYoutubePlaylist = (body,title,desc,privacy,privIfUn) =>
{
    return axios.post(`${BASE_URL}/yt/playlists?title=${title}&desc=${desc}&privacy=${privacy}&privIfUn=${privIfUn}`,
    {
        list: body.list,
        name: body.name,
        description: body.description,
        public: body.public  
    });
}

export const getSpotifyPlaylists = () =>
{
    return axios.get(`${BASE_URL}/s/playlists`);
}

export const createSpotifyPlaylist = (body,title,desc,privacy,privIfUn) =>
{
    return axios.post(`${BASE_URL}/s/playlists?title=${title}&desc=${desc}&privacy=${privacy}&privIfUn=${privIfUn}`,
    {
        list: body.list,
        name: body.name,
        description: body.description,
        public: body.public  
    });
}