import { useEffect, useState } from 'react';
import { player } from '@/music';
import { useVolume } from '@/hooks/useVolume';

export default function MusicPlayer() {
  const [, force] = useState(0);
  const [volume, setVolume] = useVolume('pokemax.music.volume', 0.12);

  useEffect(() => {
    return player.subscribe(() => force((n) => n + 1));
  }, []);

  // Keep the synth in sync with the persisted slider value
  useEffect(() => {
    player.setVolume(volume);
  }, [volume]);

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
        <button
          type="button"
          className={'crt-music-btn shuffle' + (player.isShuffling() ? ' active' : '')}
          onClick={() => player.toggleShuffle()}
          aria-pressed={player.isShuffling()}
          aria-label="Toggle shuffle"
          title={player.isShuffling() ? 'Shuffle on' : 'Shuffle off'}
        >
          ⇄
        </button>
        <span className="crt-music-track">
          ♪ {track.name}
          {' '}
          <span className="crt-music-counter">[{player.currentIndex + 1}/{player.tracks.length}]</span>
        </span>
        <label className="crt-volume" title="Music volume">
          <span className="crt-volume-icon" aria-hidden="true">♪</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={volume}
            aria-label="Music volume"
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="crt-volume-slider"
          />
        </label>
      </div>
    </div>
  );
}
