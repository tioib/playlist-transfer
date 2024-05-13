require('dotenv').config({path: '../.env'});
const youtube = require("../middleware/youtube");

const express = require("express"), router = express.Router();

router.get("/playlists",youtube.getPlaylists);
router.get("/tracks",youtube.getTracks);
router.post("/playlists",youtube.generatePlaylist);

module.exports = router;