import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Music2, Loader2 } from 'lucide-react';
import { api, type Song, formatDuration } from '../utils/api';
import { usePlayer } from '../store/playerStore';

interface Props {
  onClose: () => void;
}

export default function SearchPanel({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<any>(null);
  const { playSong } = usePlayer();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const r = await api.search(q);
      setResults(r.result?.songs || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (query) {
      timerRef.current = setTimeout(() => doSearch(query), 350);
    } else {
      setResults([]);
    }
    return () => clearTimeout(timerRef.current);
  }, [query, doSearch]);

  const playNow = (song: Song) => {
    const queue = results.length ? results : [song];
    playSong(song, queue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-10 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden rounded-2xl"
        style={{ background: '#141414', border: '1px solid #2a2a2a' }}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#2a2a2a]">
          <Search className="w-5 h-5 text-[#666]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索歌曲 / 歌手 / 专辑…"
            className="flex-1 bg-transparent outline-none text-lg text-[#e8e4df] placeholder:text-[#444]"
          />
          <button
            onClick={onClose}
            className="text-[#666] hover:text-[#e8e4df] transition"
            aria-label="close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-2 md:p-3">
          {loading && (
            <div className="flex items-center justify-center py-10 text-[#666]">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              搜索中…
            </div>
          )}
          {!loading && query && results.length === 0 && (
            <div className="py-10 text-center text-[#666] text-sm">没有找到相关歌曲</div>
          )}
          <div className="flex flex-col">
            {results.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => playNow(s)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1a1a1a] transition text-left group"
              >
                <div className="w-8 text-sm text-[#666] tabular-nums">{idx + 1}</div>
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                  {s.album?.picUrl ? (
                    <img
                      src={s.album.picUrl}
                      alt="cover"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Music2 className="w-4 h-4 text-[#444]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-[#e8e4df] group-hover:text-[#c9a96e]">
                    {s.name}
                  </div>
                  <div className="truncate text-xs text-[#666]">
                    {s.artists?.map((a) => a.name).join(' / ')} · {s.album?.name}
                  </div>
                </div>
                <div className="text-xs text-[#666] tabular-nums">
                  {formatDuration(s.duration)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
