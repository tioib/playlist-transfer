const {Schema, model} = require('mongoose');

module.exports = model('User', new Schema({
    yt_id: String,
    s_id: String,
    yt_refresh: String,
    s_refresh: String,
    premium: Boolean
}));