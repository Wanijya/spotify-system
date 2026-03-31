import { uploadFile, getPresignedUrl } from "../services/storage.service.js";
import musicModel from "../models/music.model.js";
import playlistModel from "../models/playlist.model.js";
import {
  getCache,
  setCache,
  invalidateCache,
} from "../services/redis.service.js";

export async function uploadMusic(req, res) {
  const musicFile = req.files["music"][0];
  const coverImageFile = req.files["coverImage"][0];

  try {
    const musicKey = await uploadFile(musicFile);
    const coverImageKey = await uploadFile(coverImageFile);

    const music = await musicModel.create({
      title: req.body.title,
      artist: req.user.fullName.firstName + " " + req.user.fullName.lastName,
      artistId: req.user.id,
      musicKey,
      coverImageKey,
    });

    // Invalidate artist's music cache so the new song shows up immediately
    await invalidateCache(`artist_music:${req.user.id}`);

    return res
      .status(200)
      .json({ message: "Music uploaded successfully", music });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMusicById(req, res) {
  const { id } = req.params;
  try {
    const cacheKey = `music:${id}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) return res.status(200).json({ music: cachedData });

    const music = await musicModel.findById(id).lean();
    if (!music) {
      return res.status(404).json({ message: "Music not found." });
    }
    music.musicUrl = await getPresignedUrl(music.musicKey);
    music.coverImageUrl = await getPresignedUrl(music.coverImageKey);

    await setCache(cacheKey, music, 600); // Cache for 10 minutes to respect presigned URL expiry
    return res.status(200).json({ music });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}

export async function getArtistMusic(req, res) {
  try {
    const cacheKey = `artist_music:${req.user.id}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) return res.status(200).json({ musics: cachedData });

    const musicsDocs = await musicModel.find({ artistId: req.user.id }).lean();

    const musics = await Promise.all(
      musicsDocs.map(async (music) => ({
        ...music,
        musicUrl: await getPresignedUrl(music.musicKey),
        coverImageUrl: await getPresignedUrl(music.coverImageKey),
      })),
    );

    await setCache(cacheKey, musics, 600);
    return res.status(200).json({ musics });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createPlaylist(req, res) {
  const { title, musics } = req.body;
  try {
    const playlist = await playlistModel.create({
      artist: req.user.fullName.firstName + " " + req.user.fullName.lastName,
      artistId: req.user.id,
      title,
      musics,
    });

    // Invalidate playlist caches
    await invalidateCache(`user_playlists:${req.user.id}`);
    await invalidateCache(`artist_playlists:${req.user.id}`);

    return res
      .status(201)
      .json({ message: "Playlist created successfully", playlist });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}

export async function getPlaylist(req, res) {
  try {
    const cacheKey = `user_playlists:${req.user.id}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) return res.status(200).json({ playlists: cachedData });

    const playlists = await playlistModel.find({ artistId: req.user.id });

    await setCache(cacheKey, playlists, 600);
    return res.status(200).json({ playlists });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}

export async function getAllMusic(req, res) {
  const { skip = 0, limit = 10 } = req.query;
  try {
    const cacheKey = `all_music:${skip}:${limit}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData)
      return res
        .status(200)
        .json({ message: "Musics fetched successfully", musics: cachedData });

    const musicDocs = await musicModel.find().skip(skip).limit(limit).lean();
    const musics = await Promise.all(
      musicDocs.map(async (music) => ({
        ...music,
        musicUrl: await getPresignedUrl(music.musicKey),
        coverImageUrl: await getPresignedUrl(music.coverImageKey),
      })),
    );
    await setCache(cacheKey, musics, 600);
    return res
      .status(200)
      .json({ message: "Musics fetched successfully", musics });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}

export async function getPlaylistById(req, res) {
  const { id } = req.params;
  try {
    const cacheKey = `playlist:${id}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) return res.status(200).json({ playlist: cachedData });

    const playlistDoc = await playlistModel.findById(id).lean();
    if (!playlistDoc) {
      return res.status(404).json({ message: "Playlist not found." });
    }
    const musicDocs = await musicModel
      .find({ _id: { $in: playlistDoc.musics } })
      .lean();

    const musics = await Promise.all(
      musicDocs.map(async (music) => ({
        ...music,
        musicUrl: await getPresignedUrl(music.musicKey),
        coverImageUrl: await getPresignedUrl(music.coverImageKey),
      })),
    );

    playlistDoc.musics = musics;

    await setCache(cacheKey, playlistDoc, 600);
    return res.status(200).json({ playlist: playlistDoc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}

export async function getArtistPlaylist(req, res) {
  try {
    const cacheKey = `artist_playlists:${req.user.id}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) return res.status(200).json({ playlists: cachedData });

    const playlists = await playlistModel.find({ artistId: req.user.id });

    await setCache(cacheKey, playlists, 600);
    return res.status(200).json({ playlists });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}
