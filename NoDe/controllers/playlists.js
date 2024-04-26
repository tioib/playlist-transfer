const SavedPlaylist = require("../models/SavedPlaylists");

exports.getSavedPlaylistFromYtId = async (id) =>
{
    return await SavedPlaylist.find({yt_id: id})
}

exports.getSavedPlaylistFromSId = async (id) =>
{
    return await SavedPlaylist.find({s_id: id})
}

exports.createSavedPlaylist = async function(data)
{
    const savedPlaylist = new SavedPlaylist(data);
    return await savedPlaylist.save();
}

exports.deleteSavedPlaylist = async (id) => {
    return await SavedPlaylist.findByIdAndDelete(id);
}