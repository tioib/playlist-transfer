const {Schema, model} = require('mongoose');

module.exports = model('Playlist', new Schema({
    yt_user: String,
    s_user: String,
    yt_id: String,
    s_id: String,
    yt_title: String,
    s_title: String,
    yt_desc: String,
    s_Desc: String,
    yt_privacy: String,
    s_privacy: Boolean,
    link_title: Boolean,
    link_desc: Boolean,
    link_privacy: Boolean,
    s_privacy_if_unlisted: Boolean,
    yt_tracks: Array,
    s_tracks: Array
}));