import { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music2,
} from 'lucide-react';
import { usePlayer } from '../store/playerStore';
import { formatCurrentTime, formatDuration } from '../utils/api';

export default function Player() {
  const {
    currentSong,
    currentUrl,
    isPlaying,
    currentTime,
    duration,
    volume,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    setCurrentTime,
    setDuration,
    setPlaying,
  } = usePlayer();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // 管理 audio 播放状态
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying && currentUrl) {
      audio.play().catch((e) => console.warn('play error', e));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentUrl]);

  // 音量同步
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // 当点击进度条 seek 时
  useEffect(() => {
    if (audioRef.current && duration > 0) {
      const diff = Math.abs(audioRef.current.currentTime - currentTime);
      if (diff > 0.5) audioRef.current.currentTime = currentTime;
    }
  }, [currentTime, duration]);

  const onSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const t = Math.max(0, Math.min(ratio, 1)) * duration;
    seek(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  const onVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const v = Math.max(0, Math.min(ratio, 1));
    setVolume(v);
  };

  const pic = currentSong?.album?.picUrl;
  const artistNames = currentSong?.artists?.map((a: any) => a.name).join(' / ') || '';

  return (
    <>
      {/* 隐藏的 audio 元素 */}
      <audio
        ref={audioRef}
        src={currentUrl || undefined}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
        onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
        onEnded={() => next()}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        preload="metadata"
      />

      {/* 底部固定播放器 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2">
        <div className="glass rounded-2xl px-4 py-3 md:px-6 md:py-4 shadow-glow">
          <div className="grid grid-cols-12 items-center gap-4">
            {/* 左侧：当前歌曲信息 */}
            <div className="col-span-12 md:col-span-3 flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-gradient-vibes flex items-center justify-center ${
                    isPlaying ? 'animate-spin-slow' : ''
                  }`}
                  style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                >
                  {pic ? (
                    <img
                      src={pic}
                      alt="cover"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Music2 className="w-6 h-6 text-white/90" />
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate text-white">
                  {currentSong?.name || '未选择歌曲'}
                </div>
                <div className="text-xs text-white/50 truncate">{artistNames || '—'}</div>
              </div>
            </div>

            {/* 中间：播放控制 + 进度 */}
            <div className="col-span-12 md:col-span-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-5">
                <button
                  onClick={prev}
                  className="text-white/70 hover:text-white transition"
                  aria-label="prev"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={toggle}
                  disabled={!currentUrl}
                  className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition disabled:opacity-40 shadow-lg"
                  aria-label="play/pause"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button
                  onClick={next}
                  className="text-white/70 hover:text-white transition"
                  aria-label="next"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full flex items-center gap-2 text-xs text-white/50">
                <span className="w-10 text-right tabular-nums">{formatCurrentTime(currentTime)}</span>
                <div
                  ref={progressRef}
                  onClick={onSeekClick}
                  className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group relative"
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-vibes transition-[width] duration-150"
                    style={{
                      width: duration ? `${(currentTime / duration) * 100}%` : '0%',
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition"
                    style={{ left: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                  />
                </div>
                <span className="w-10 tabular-nums">
                  {duration ? formatCurrentTime(duration) : formatDuration(currentSong?.duration || 0)}
                </span>
              </div>
            </div>

            {/* 右侧：音量 */}
            <div className="hidden md:flex col-span-3 items-center justify-end gap-2">
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-white/60" />
              ) : (
                <Volume2 className="w-4 h-4 text-white/60" />
              )}
              <div
                onClick={onVolumeClick}
                className="w-28 h-1.5 bg-white/10 rounded-full cursor-pointer group relative"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white/80"
                  style={{ width: `${volume * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
