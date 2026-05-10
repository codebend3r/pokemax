import { useEffect, useState } from 'react';
import { player } from '../music';

export default function MusicPlayer() {
  const [, force] = useState(0);

  useEffect(() => {
    return player.subscribe(() => force((n) => n + 1));
  }, []);

  const track = player.currentTrack;
  const playing = player.isPlaying;

  return (
    <div className="crt-music" role="region" aria-label="Music player">
      <div className="crt-music-row">
        <button
          type="button"
          className="crt-music-btn"
          onClick={() => player.prev()}
          aria-label="Previous track"
          title="Previous"
        >
          ◀◀
        </button>
        <button
          type="button"
          className="crt-music-btn play"
          onClick={() => player.toggle()}
          aria-label={playing ? 'Pause' : 'Play'}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <button
          type="button"
          className="crt-music-btn"
          onClick={() => player.next()}
          aria-label="Next track"
          title="Next"
        >
          ▶▶
        </button>
        <span className="crt-music-track">
          ♪ {track.name}
          {' '}
          <span className="crt-music-counter">[{player.currentIndex + 1}/{player.tracks.length}]</span>
        </span>
      </div>
    </div>
  );
}
