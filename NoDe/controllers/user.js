const User = require("../models/User");

exports.getUserFromYtId = async (id) =>
{
    return await User.find({yt_id: id})
}

exports.getUserFromSId = async (id) =>
{
    return await User.find({s_id: id})
}

exports.createUser = async function(data)
{
    const user = new User(data);
    return await user.save();
}

exports.deleteUserByYtId = async (id) => {
    return await User.deleteMany({yt_id: id});
}

exports.deleteUserBySId = async (id) => {
    return await User.deleteMany({yt_id: id});
}