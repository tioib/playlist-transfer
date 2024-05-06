const {Schema, model} = require('mongoose');

module.exports = model('User', new Schema({
    yt_id: String,
    s_id: String,
    yt_refresh: String,
    s_refresh: String,
    yt_access: String,
    s_access: String,
    yt_interval: Number,
    s_interval: Number,
    premium: Boolean
}));