import express from "express";
import multer from "multer";
import * as musicController from "../controllers/music.controller.js";
import * as authMiddleware from "../middlewares/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
});
const router = express.Router();

/* Upload music (POST /api/music/upload) */
router.post(
  "/upload",
  authMiddleware.authArtistMiddleware,
  upload.fields([
    { name: "music", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  musicController.uploadMusic,
);

/* Get all music (GET /api/music/) */
router.get("/", authMiddleware.authUserMiddleware, musicController.getAllMusic);

/* Get music details (GET /api/music/get-details/:id) */
router.get("/get-details/:id", authMiddleware.authUserMiddleware, musicController.getMusicById);

/* Get artist music (GET /api/music/artist-musics) */
router.get("/artist-musics", authMiddleware.authArtistMiddleware, musicController.getArtistMusic);

/* Create playlist (POST /api/music/playlist) */
router.post("/playlist", authMiddleware.authArtistMiddleware, musicController.createPlaylist)

/* Get artist playlist (GET /api/music/playlist/artist) */
router.get("/playlist/artist", authMiddleware.authArtistMiddleware, musicController.getArtistPlaylist)

/* Get playlist (GET /api/music/playlist) */
router.get("/playlist", authMiddleware.authUserMiddleware, musicController.getPlaylist)

/* Get specific playlist song (GET /api/music/playlist/:id) */
router.get("/playlist/:id", authMiddleware.authUserMiddleware, musicController.getPlaylistById)

export default router;
