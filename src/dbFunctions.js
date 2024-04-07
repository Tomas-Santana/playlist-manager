import { request } from "./init";
import { renderGivenSongs, renderSongs } from ".";


export const getSongs = () => {
    const db = request.result;
    // make it a promise
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["songs"], "readonly");
        const objectStore = transaction.objectStore("songs");
        const request = objectStore.getAll();
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}

export const getPlaylists = () => {
    const db = request.result;
    // make it a promise
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["playlists"], "readonly");
        const objectStore = transaction.objectStore("playlists");
        const request = objectStore.getAll();
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}

export const getPlaylist = (id) => {
    const db = request.result

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["playlists"], "readonly");
        const objectStore = transaction.objectStore("playlists");
        const request = objectStore.get(id);
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}

export const getSong = (id) => {
    const db = request.result;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["songs"], "readonly");
        const objectStore = transaction.objectStore("songs");
        const request = objectStore.get(id);
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}

export const getSongsByIds = (songIds) => {
    const db = request.result;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["songs"], "readonly");
        const objectStore = transaction.objectStore("songs");
        const songs = [];

        songIds.forEach(id => {
            const request = objectStore.get(id);
            request.onsuccess = () => {
                songs.push(request.result);
                if (songs.length === songIds.length) {
                    resolve(songs);
                }
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    });
}

export const getSongsLength = () => {
    const db = request.result;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["songs"], "readonly");
        const objectStore = transaction.objectStore("songs");
        const request = objectStore.count();
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}

export const addSongToPlaylist = (playlistId, songId) => {
    const db = request.result;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["playlists"], "readwrite");
        const objectStore = transaction.objectStore("playlists");
        const request = objectStore.get(playlistId);
        request.onsuccess = () => {
            const playlist = request.result;
            if (!playlist.songs.includes(songId)) playlist.songs.push(songId);
            objectStore.put(playlist);
            resolve();
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}

export const removeSongFromPlaylist = (playlistId, songId) => {
    const db = request.result;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["playlists"], "readwrite");
        const objectStore = transaction.objectStore("playlists");
        const request = objectStore.get(playlistId);
        request.onsuccess = () => {
            const playlist = request.result;
            const index = playlist.songs.indexOf(songId);
            if (index !== -1) playlist.songs.splice(index, 1);
            objectStore.put(playlist);
            resolve();
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}

export const deleteSong = (id) => {
    const db = request.result;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["songs", "playlists"], "readwrite");
        const songsStore = transaction.objectStore("songs");
        const request = songsStore.delete(id);

        const playlistsStore = transaction.objectStore("playlists");
        const playlistsRequest = playlistsStore.getAll();

        playlistsRequest.onsuccess = () => {
            const playlists = playlistsRequest.result;
            playlists.forEach(playlist => {
                const index = playlist.songs.indexOf(id);
                if (index !== -1) {
                    playlist.songs.splice(index, 1);
                    playlistsStore.put(playlist);
                }
            });
            resolve();
        }
 
        request.onerror = () => {
            reject(request.error);
        };
    });
}

export const addPlaylist = (name) => {
    const db = request.result;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["playlists"], "readwrite");
        const objectStore = transaction.objectStore("playlists");
        const request = objectStore.add({ name, songs: [] });
        request.onsuccess = () => {
            resolve();
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}

export const deletePlaylist = (id) => {
    const db = request.result;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["playlists"], "readwrite");
        const objectStore = transaction.objectStore("playlists");
        const request = objectStore.delete(id);
        request.onsuccess = () => {
            resolve();
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}

export const addSong = (song) => {
    const db = request.result;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["songs"], "readwrite");
        const objectStore = transaction.objectStore("songs");
        const request = objectStore.add(song);
        request.onsuccess = () => {
            resolve();
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}

export const searchSongs = (query) => {
    const db = request.result;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["songs"], "readonly");
        const objectStore = transaction.objectStore("songs");
        const index = objectStore.index("name");
        
        const request = index.getAll(IDBKeyRange.bound(query, query + "\uffff"));
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}

const searchLibInput = document.querySelector("#search-library");

searchLibInput.addEventListener("input", async (event) => {
    const query = searchLibInput.value;
    if (!query) renderSongs();
    const songs = await searchSongs(query);
    renderGivenSongs(songs);
});




