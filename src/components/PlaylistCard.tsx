import { Play, Heart } from 'lucide-react';
import type { Playlist } from '../utils/api';

interface Props {
  playlist: Playlist;
  onOpen: (playlist: Playlist) => void;
  isFavorite?: boolean;
}

export default function PlaylistCard({ playlist, onOpen, isFavorite }: Props) {
  return (
    <button
      onClick={() => onOpen(playlist)}
      className="group text-left w-full relative rounded-2xl p-3 md:p-4 bg-white/[0.02] hover:bg-white/[0.06] transition-all hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-vibes mb-3">
        {playlist.coverImgUrl ? (
          <img
            src={playlist.coverImgUrl}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/80">
            <Play className="w-10 h-10" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl translate-y-2 group-hover:translate-y-0 transition">
            <Play className="w-5 h-5 ml-0.5" />
          </div>
        </div>

        {isFavorite && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-pink-500/90 text-white text-[10px] font-semibold flex items-center gap-1">
            <Heart className="w-3 h-3 fill-white" /> 我喜欢
          </div>
        )}
      </div>

      <div className="px-1">
        <div className="text-sm font-semibold text-white truncate group-hover:text-gradient-vibes transition">
          {playlist.name}
        </div>
        {playlist.description && (
          <div className="text-xs text-white/40 line-clamp-1 mt-1">{playlist.description}</div>
        )}
        {playlist.trackCount !== undefined && (
          <div className="text-xs text-white/40 mt-1">{playlist.trackCount} 首</div>
        )}
      </div>
    </button>
  );
}
