import { getSong, getSongsLength } from "./dbFunctions";

export const nextSong = async () => {
  let nextSong;
  const currentSongId = parseInt(player.full.dataset.song);
  const playlistId = currentPlaylist.playing;
  if (!playlistId) {
    // select from all songs
    console.log("no playlist selected");
    if (!shuffle) {
      let nextId = currentSongId + 1;
      if (nextId > (await getSongsLength())) nextId = 1;
      nextSong = await getSong(nextId);
      while (!nextSong) {
        nextId += 1;
        if (nextId > (await getSongsLength())) nextId = 1;
        nextSong = await getSong(nextId);
      }
    } else {
      let randomIndex =
        Math.floor(Math.random() * (await getSongsLength())) + 1;

      nextSong = await getSong(randomIndex);
      while (randomIndex === currentSongId || !nextSong) {
        randomIndex = Math.floor(Math.random() * (await getSongsLength())) + 1;
        nextSong = await getSong(randomIndex);
      }

    }
  } else {
    console.log("playlist selected");
    const currentSongIndex = currentPlaylist.songs.findIndex(
      (songId) => songId === currentSongId
    );
    if (!shuffle) {
      const nextSongId =
        currentPlaylist.songs[
          (currentSongIndex + 1) % currentPlaylist.songs.length
        ];
      nextSong = await getSong(nextSongId);
    } else {
      let randomIndex =
        Math.floor(Math.random() * currentPlaylist.songs.length) ;
      while (currentPlaylist.songs[randomIndex] === currentSongId) {
        randomIndex =
          Math.floor(Math.random() * currentPlaylist.songs.length) ;
      }
      console.log(randomIndex);
      console.log(currentPlaylist.songs[randomIndex]);
      nextSong = await getSong(currentPlaylist.songs[randomIndex]);
    }
  }
  const isPaused = player.audioElement.paused;
  player.audioElement.src = nextSong.location;
  if (!isPaused) player.audioElement.play();
  player.songTitle.textContent = nextSong.name;
  player.songArtist.textContent = nextSong.artist;
  player.full.dataset.song = nextSong.id;
  // set slider max
  player.audioElement.addEventListener("loadedmetadata", () => {
    player.slider.max = player.audioElement.duration;
  });
};

player.nextButton.addEventListener("click", nextSong);

const previousSong = async () => {
  let nextSong;
  const currentSongId = parseInt(player.full.dataset.song);
  const playlistId = currentPlaylist.playing;
  if (!playlistId) {
    // select from all songs
    let nextId = currentSongId - 1;
    if (nextId < 1) nextId = await getSongsLength();
    nextSong = await getSong(nextId);

    while (!nextSong) {
      nextId -= 1;
      if (nextId < 1) nextId = await getSongsLength();
      nextSong = await getSong(nextId);
    }
  } else {
    const currentSongIndex = currentPlaylist.songs.findIndex(
      (songId) => songId === currentSongId
    );
    const nextSongId =
      currentPlaylist.songs[
        (currentSongIndex - 1 + currentPlaylist.songs.length) %
          currentPlaylist.songs.length
      ];
    nextSong = await getSong(nextSongId);
  }

  const isPaused = player.audioElement.paused;
  player.audioElement.src = nextSong.location;
  if (!isPaused) player.audioElement.play();
  player.songTitle.textContent = nextSong.name;
  player.songArtist.textContent = nextSong.artist;
  player.full.dataset.song = nextSong.id;

  // set slider max
  player.audioElement.addEventListener("loadedmetadata", () => {
    player.slider.max = player.audioElement.duration;
  });
};

player.prevButton.addEventListener("click", previousSong);

player.audioElement.addEventListener("ended", (e) => {
  nextSong();
  player.audioElement.play();
});
player.audioElement.addEventListener("timeupdate", () => {
  player.slider.value = player.audioElement.currentTime;
});

player.slider.addEventListener("input", () => {
  player.audioElement.currentTime = player.slider.value;
});

player.playButton.addEventListener("click", () => {
  player.audioElement.play();
  player.playButton.classList.add("hidden");
  player.pauseButton.classList.remove("hidden");
});

player.pauseButton.addEventListener("click", () => {
  player.audioElement.pause();
  player.playButton.classList.remove("hidden");
  player.pauseButton.classList.add("hidden");
});

// mouse hover show volume slider container
player.volume.full.addEventListener("mouseenter", () => {
  player.volume.container.classList.remove("hidden");
});
player.volume.full.addEventListener("mouseleave", () => {
  player.volume.container.classList.add("hidden");
});
player.volume.slider.addEventListener("input", () => {
  player.audioElement.volume = player.volume.slider.value / 100;
});

const shuffleOff = () => {
  shuffle = false;
  player.shuffleButtonOn.classList.add("hidden");
  player.shuffleButtonOff.classList.remove("hidden");
};
player.shuffleButtonOn.addEventListener("click", shuffleOff);

const shuffleOn = () => {
  shuffle = true;
  player.shuffleButtonOn.classList.remove("hidden");
  player.shuffleButtonOff.classList.add("hidden");
};

player.shuffleButtonOff.addEventListener("click", shuffleOn);
