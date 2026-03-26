import { uploadFile, getPresignedUrl } from "../services/storage.service.js";
import musicModel from "../models/music.model.js";
import playlistModel from "../models/playlist.model.js";

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
    const music = await musicModel.findById(id).lean();
    if (!music) {
      return res.status(404).json({ message: "Music not found." });
    }
    music.musicUrl = await getPresignedUrl(music.musicKey);
    music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
    return res.status(200).json({ music });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}

export async function getArtistMusic(req, res) {
  try {
    const musicsDocs = await musicModel.find({ artistId: req.user.id }).lean();

    let musics = [];

    for (let music of musicsDocs) {
      music.musicUrl = await getPresignedUrl(music.musicKey);
      music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
      musics.push(music);
    }

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
    const playlists = await playlistModel.find({ artistId: req.user.id });

    return res.status(200).json({ playlists });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}

export async function getAllMusic(req, res) {
  const { skip = 0, limit = 10 } = req.query;
  try {
    const musicDocs = await musicModel.find().skip(skip).limit(limit).lean();
    const musics = [];
    for (let music of musicDocs) {
      music.musicUrl = await getPresignedUrl(music.musicKey);
      music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
      musics.push(music);
    }
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
    const playlistDoc = await playlistModel.findById(id).lean();
    if (!playlistDoc) {
      return res.status(404).json({ message: "Playlist not found." });
    }
    const musics = [];
    for (let musicId of playlistDoc.musics) {
      const music = await musicModel.findById(musicId).lean();
      if (music) {
        music.musicUrl = await getPresignedUrl(music.musicKey);
        music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
        musics.push(music);
      }
    }
    playlistDoc.musics = musics;

    return res.status(200).json({ playlist: playlistDoc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}

export async function getArtistPlaylist(req, res) {
  try {
    const playlists = await playlistModel.find({ artistId: req.user.id });

    return res.status(200).json({ playlists });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}
