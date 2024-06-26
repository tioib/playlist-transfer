require('dotenv').config({path: '../.env'});
const spotify = require("../middleware/spotify");

const express = require("express"), router = express.Router();

router.get("/playlists",spotify.getPlaylists);
router.post("/playlists",spotify.generatePlaylist);

module.exports = router;