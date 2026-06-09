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
      className="group text-left w-full relative rounded-xl p-3 md:p-4 bg-[#141414] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#333] transition-all"
    >
      <div className="relative aspect-square rounded-lg overflow-hidden bg-[#1a1a1a] mb-3">
        {playlist.coverImgUrl ? (
          <img
            src={playlist.coverImgUrl}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#444]">
            <Play className="w-10 h-10" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#c9a96e] text-[#0d0d0d] flex items-center justify-center translate-y-2 group-hover:translate-y-0 transition">
            <Play className="w-5 h-5 ml-0.5" />
          </div>
        </div>

        {isFavorite && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-[#c9a96e]/90 text-[#0d0d0d] text-[10px] font-semibold flex items-center gap-1">
            <Heart className="w-3 h-3 fill-current" /> 我喜欢
          </div>
        )}
      </div>

      <div className="px-1">
        <div className="text-sm font-medium text-[#e8e4df] truncate group-hover:text-[#c9a96e] transition-colors">
          {playlist.name}
        </div>
        {playlist.description && (
          <div className="text-xs text-[#666] line-clamp-1 mt-1">{playlist.description}</div>
        )}
        {playlist.trackCount !== undefined && (
          <div className="text-xs text-[#666] mt-1">{playlist.trackCount} 首</div>
        )}
      </div>
    </button>
  );
}
