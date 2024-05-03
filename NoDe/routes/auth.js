require('dotenv').config({path: '../.env'});
const tokenManager = require("../middleware/auth");

const express = require("express"), router = express.Router();

router.get("/yt",tokenManager.setYoutubeToken);
router.get("/yt/generate",tokenManager.sendYoutubeLink);

router.get("/s",tokenManager.setSpotifyToken);
router.get("/s/generate",tokenManager.sendSpotifyLink);

router.get("/yt/confirm",tokenManager.confirmYoutube);
router.get("/s/confirm",tokenManager.confirmSpotify);

router.post("/unlink",tokenManager.unlink);
router.post("/logout",tokenManager.logout);

module.exports = router;