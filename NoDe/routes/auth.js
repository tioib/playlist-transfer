require('dotenv').config({path: '../.env'});
const tokenManager = require("../middleware/auth");

const express = require("express"), router = express.Router();

router.get("/yt",tokenManager.setYoutubeToken);
router.get("/yt/generate",tokenManager.sendYoutubeLink);

router.get("/s",tokenManager.setSpotifyToken);
router.get("/s/generate",tokenManager.sendSpotifyLink);

router.get("/confirm",tokenManager.confirmTokens);
router.post("/unlink",tokenManager.unlink);

module.exports = router;