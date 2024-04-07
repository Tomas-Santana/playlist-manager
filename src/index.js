import data from "../data/data";
import { nextSong } from "./audioPlayer";
import {
  getSongs,
  getPlaylists,
  getPlaylist,
  getSongsByIds,
  getSong,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deleteSong,
  deletePlaylist,
} from "./dbFunctions";


playlistSongs.addEventListener("dragover", async (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
});
playlistSongs.addEventListener("drop", async (event) => {
  console.log(event);
  const id = parseInt(playlistSongs.dataset.id);
  if (!id) {
    return;
  }
  const songId = parseInt(event.dataTransfer.getData("text/plain"));
  await addSongToPlaylist(id, songId);
  selectPlaylist(id);
});

const selectSong = async (event) => {
  const id = parseInt(event.target.dataset.id);
  const playlistId = parseInt(event.target.dataset.playlist);
  currentPlaylist.playing = playlistId;
  const song = await getSong(id);
  player.audioElement.src = song.location;
  player.audioElement.play();
  player.songTitle.textContent = song.name;
  player.songArtist.textContent = song.artist;
  player.playlist.textContent = "Playing from: ";
  console.log(playlistId);
  if (playlistId) {
    const playlist = await getPlaylist(playlistId);
    player.playlist.textContent += playlist.name;
  } else {
    player.playlist.textContent += "All Songs";
  }

  player.full.dataset.song = id;
  player.full.classList.remove("translate-y-52");
  player.audioElement.addEventListener("loadedmetadata", () => {
    player.slider.max = player.audioElement.duration;
    player.duration.textContent = formatTime(player.audioElement.duration);
  });
};

player.audioElement.addEventListener("timeupdate", () => {
  player.slider.value = player.audioElement.currentTime;
  player.currentTime.textContent = formatTime(player.audioElement.currentTime);
});

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};

const getPlaylistElement = (playlist) => {
  const li = document.createElement("li");
  const deleteButton = document.createElement("button");

  li.classList.add(
    "w-full",
    "hover:bg-slate-100",
    "transition-all",
    "select-none",
    "cursor-pointer",
    "p-1",
    "list-none",
    "rounded-md",
    "flex",
    "justify-between"
  );
  li.dataset.id = playlist.id;
  li.textContent = playlist.name;
  li.addEventListener("click", () => selectPlaylist(playlist.id));

  deleteButton.textContent = "🗑️";
  deleteButton.addEventListener("click", async (event) => {
    event.stopPropagation();
    await deletePlaylist(playlist.id);
    renderPlaylists();
  });

  li.appendChild(deleteButton);



  return li;
};

const getSongElement = (song, playlist = 0) => {
  const li = document.createElement("li");
  const deleteButton = document.createElement("button");
  li.classList.add(
    "w-full",
    "hover:bg-slate-100",
    "transition-all",
    "select-none",
    "cursor-pointer",
    "p-1",
    "list-none",
    "rounded-md",
    "flex",
    "justify-between"
  );
  li.innerHTML = `${song.name} - ${song.artist} `;
  li.dataset.id = song.id;
  li.dataset.playlist = playlist;
  li.tabIndex = 0;
  li.addEventListener("click", selectSong);

  // when focused, pressing enter should play the song
  li.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      selectSong(event);
    }
  });

  deleteButton.textContent = "🗑️";

  if (playlist) {
    deleteButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      await removeSongFromPlaylist(playlist, song.id);
      selectPlaylist(playlist);
    });
  } else {
    deleteButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      if (currentPlaylist.playing === playlist && parseInt(li.dataset.id) === parseInt(player.full.dataset.song)) {
        nextSong();
      }
      await deleteSong(song.id);
      renderSongs();
      if (currentPlaylist.showing) selectPlaylist(currentPlaylist.showing)
    });
  }

  li.appendChild(deleteButton);

  li.draggable = true;
  li.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", song.id);
    event.dataTransfer.dropEffect = "move";
  });
  return li;
};

async function selectPlaylist(id) {
  const playlist = await getPlaylist(id);
  let songs = [];
  if (playlist.songs.length !== 0) {
    songs = await getSongsByIds(playlist.songs);
  }

  playlistSongs.innerHTML = "";
  playlistSongs.dataset.id = id;
  document.querySelector("#current-playlist-title").textContent = playlist.name;
  songs.forEach((song) => {
    playlistSongs.appendChild(getSongElement(song, id));
  });

  currentPlaylist.showing = id;
  currentPlaylist.songs = playlist.songs;
  console.log(currentPlaylist.songs);
}

export var renderPlaylists = async () => {
  allPlaylists.innerHTML = "";
  const playlists = await getPlaylists();
  console.log(playlists);
  playlists.forEach((playlist) => {
    console.log(playlist);
    allPlaylists.appendChild(getPlaylistElement(playlist));
  });

  console.log("rendering playlists");
};

export async function renderSongs() {
  allSongs.innerHTML = "";

  const songs = await getSongs();
  console.log(songs);
  songs.forEach((song) => {
    allSongs.appendChild(getSongElement(song, 0));
  });
}

export async function renderGivenSongs(songs) {
  allSongs.innerHTML = "";
  songs.forEach((song) => {
    allSongs.appendChild(getSongElement(song, 0));
  });
}


