import { renderPlaylists, renderSongs } from ".";
import { addPlaylist, addSong} from "./dbFunctions";

const createPlaylistDialog = document.getElementById("create-playlist-dialog");
const createPlaylistButton = document.getElementById("add-playlist");
const createPlaylistForm = document.createElement("form");
createPlaylistDialog.appendChild(createPlaylistForm);
createPlaylistDialog.classList.add(
  "w-1/2",
  "p-4",
  "bg-white",
  "rounded-md",
  "shadow-md"
);
createPlaylistForm.classList.add("flex", "flex-col", "gap-4");
createPlaylistForm.innerHTML = `
    <label for="playlist-name" class="text-lg">Playlist Name</label>
    <input type="text" id="playlist-name" class="p-2 border border-gray-300 rounded-md">
    <button type="submit" class="p-2 bg-blue-500 text-white rounded-md">Create Playlist</button>
`;
document.body.appendChild(createPlaylistDialog);

createPlaylistButton.addEventListener("click", () => {
  createPlaylistDialog.showModal();
});

createPlaylistForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("playlist-name").value;
  if (!name) {
    alert("Please fill all fields");
  }
  await addPlaylist(name);

  await renderPlaylists();
  createPlaylistDialog.close();
  createPlaylistForm.reset();
});

const addSongDialog = document.getElementById("add-song-dialog");
const addSongButton = document.getElementById("add-song");
const addSongForm = document.createElement("form");
const addSongFile = document.createElement("input");
addSongDialog.appendChild(addSongForm);
addSongDialog.classList.add(
  "w-1/2",
  "p-4",
  "bg-white",
  "rounded-md",
  "shadow-md"
);
addSongForm.classList.add("flex", "flex-col", "gap-4");

addSongFile.type = "file";
addSongFile.id = "input-song-file";
addSongFile.classList.add("file-input", "file-input-bordered");

addSongForm.innerHTML = `
    <label for="input-song-file" class="text-lg">File</label>
`;
addSongForm.appendChild(addSongFile);



addSongButton.addEventListener("click", () => {
  addSongDialog.showModal();
});

addSongForm.innerHTML += `
<label for="input-song-name" class="text-lg">Song Name</label>
<input type="text" id="input-song-name" class="p-2 border border-gray-300 rounded-md">
<label for="input-song-artist" class="text-lg">Artist</label>
<input type="text" id="input-song-artist" class="p-2 border border-gray-300 rounded-md">
<label for="input-song-album" class="text-lg">Album</label>
<input type="text" id="input-song-album" class="p-2 border border-gray-300 rounded-md">
<label for="input-song-year" class="text-lg">Year</label>
<input type="number" id="input-song-year" class="p-2 border border-gray-300 rounded-md">
<button type="submit" class="p-2 bg-blue-500 text-white rounded-md">Add Song</button>
`;

addSongForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("input-song-name").value;
  console.log(document.getElementById("input-song-artist"));
  const artist = document.getElementById("input-song-artist").value;
  const album = document.getElementById("input-song-album").value;
  const year = document.getElementById("input-song-year").value;
  const file = document.getElementById("input-song-file").files[0];

  if (!name || !artist || !album || !year || !file) {
    alert("Please fill all fields");
  }
  // check if file is audio
  if (!file.type.startsWith("audio/")) {
    alert("Please upload an audio file");
    return;
  }


  const location = `songs/${file.name}`;

  await addSong({ name, artist, album, year, location });
  await renderSongs();
  addSongDialog.close();
  addSongForm.reset();
});

document.body.appendChild(addSongDialog);