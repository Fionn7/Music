import { useEffect, useState } from 'react';
import { X, Play, Music2, Loader2 } from 'lucide-react';
import { api, type Song, type Playlist, formatDuration } from '../utils/api';
import { usePlayer } from '../store/playerStore';

interface Props {
  playlist: Playlist;
  onClose: () => void;
}

export default function PlaylistDetail({ playlist, onClose }: Props) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong, setPlaying } = usePlayer();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await api.playlistTracks(playlist.id, 200, 0);
        setSongs(r.songs || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [playlist.id]);

  const playOne = (song: Song) => {
    playSong(song, songs.length ? songs : [song]);
  };

  const playAll = () => {
    if (!songs.length) return;
    playSong(songs[0], songs);
    setPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-4xl overflow-hidden rounded-2xl my-auto"
        style={{ background: '#141414', border: '1px solid #2a2a2a' }}
      >
        <div className="relative p-6 md:p-8" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#666] hover:text-[#e8e4df] z-10 transition"
            aria-label="close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div
              className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden flex-shrink-0 bg-[#1a1a1a] flex items-center justify-center"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            >
              {playlist.coverImgUrl ? (
                <img
                  src={playlist.coverImgUrl}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Music2 className="w-16 h-16 text-[#444]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-widest text-[#666] mb-2">歌单</div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#e8e4df] mb-3">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-sm text-[#666] line-clamp-2 mb-4">{playlist.description}</p>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={playAll}
                  disabled={!songs.length}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition disabled:opacity-40"
                  style={{ background: '#c9a96e', color: '#0d0d0d' }}
                >
                  <Play className="w-4 h-4" /> 播放全部
                </button>
                <span className="text-xs text-[#666]">{songs.length || '…'} 首</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 md:px-4 pb-4 max-h-[50vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-10 text-[#666]">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> 加载歌曲…
            </div>
          )}
          {!loading && !songs.length && (
            <div className="py-10 text-center text-[#666] text-sm">这个歌单是空的</div>
          )}
          {songs.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => playOne(s)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#1a1a1a] transition text-left group"
            >
              <div className="w-6 text-xs text-[#666] tabular-nums text-right">{idx + 1}</div>
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                {s.album?.picUrl ? (
                  <img
                    src={s.album.picUrl}
                    alt="cover"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Music2 className="w-3.5 h-3.5 text-[#444]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm text-[#e8e4df] group-hover:text-[#c9a96e]">
                  {s.name}
                </div>
                <div className="truncate text-xs text-[#666]">
                  {s.artists?.map((a) => a.name).join(' / ')} · {s.album?.name}
                </div>
              </div>
              <div className="text-xs text-[#666] tabular-nums">{formatDuration(s.duration)}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
