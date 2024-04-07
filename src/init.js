import { renderSongs, renderPlaylists } from ".";
import data from "../data/data";

// indexedDB.deleteDatabase("music-player");

export const request = indexedDB.open("music-player", 1);

request.onupgradeneeded = (event) => {
  /**
   * @type {IDBDatabase}
   */
  const db = event.target.result;
  const store = db.createObjectStore("songs", {
    keyPath: "id",
    autoIncrement: true,
  });
  store.createIndex("name", "name", { unique: false });
  store.createIndex("artist", "artist", { unique: false });
  store.createIndex("album", "album", { unique: false });
  store.createIndex("year", "year", { unique: false });

  const playlistStore = db.createObjectStore("playlists", {
    keyPath: "id",
    autoIncrement: true,
  });
  playlistStore.createIndex("name", "name", { unique: false });
};

request.onerror = () => {
  console.log("cannot open db");
};

request.onsuccess = (event) => {
  const db = event.target.result;
  const transaction = db.transaction(["songs", "playlists"], "readwrite");
  const songStore = transaction.objectStore("songs");

  // if there are no songs in the db, add the default songs, get all songs

  const songRequest = songStore.getAll();
  songRequest.onsuccess = () => {
    if (songRequest.result.length === 0) {
      data.songs.forEach((song) => {
        songStore.add(song);
      });
    }
    else {
        // create a playlist with id 0 with all songs
        const playlistStore = transaction.objectStore("playlists");
        const playlistRequest = playlistStore.getAll();
    }
  };


  const playlistStore = transaction.objectStore("playlists");
  const playlistRequest = playlistStore.getAll();
  playlistRequest.onsuccess = () => {
    if (playlistRequest.result.length === 0) {
      data.playlists.forEach((playlist) => {
        playlistStore.add(playlist);
      });
    }
  };

  renderSongs();
  renderPlaylists();
};
