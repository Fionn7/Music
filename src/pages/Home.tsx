import { useEffect, useState } from 'react';
import { Search, Music2, Loader2, Sparkles, TrendingUp, ExternalLink } from 'lucide-react';
import { api, type Playlist as PlaylistT, type Song } from '../utils/api';
import { usePlayer } from '../store/playerStore';
import PlaylistCard from '../components/PlaylistCard';
import PlaylistDetail from '../components/PlaylistDetail';
import SearchPanel from '../components/SearchPanel';
import ShareInput from '../components/ShareInput';

export default function Home() {
  const [showSearch, setShowSearch] = useState(false);

  const [personalized, setPersonalized] = useState<PlaylistT[]>([]);
  const [toplists, setToplists] = useState<PlaylistT[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);

  const [detailPlaylist, setDetailPlaylist] = useState<PlaylistT | null>(null);

  const { currentSong, playSong } = usePlayer();

  // 加载推荐歌单 + 排行榜
  useEffect(() => {
    (async () => {
      setLoadingPlaylists(true);
      try {
        const [pRes, tRes] = await Promise.all([api.personalized(12), api.toplist()]);
        setPersonalized(pRes.result || []);
        setToplists((tRes.list || []).slice(0, 4));
      } catch (e) {
        // ignore
      } finally {
        setLoadingPlaylists(false);
      }
    })();
  }, []);

  const openPlaylist = (pl: PlaylistT) => {
    setDetailPlaylist(pl);
  };

  return (
    <div className="min-h-screen pb-40">
      {/* Header */}
      <header className="border-b border-[#2a2a2a]">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Music2 className="text-[#c9a96e]" size={28} />
            <h1 className="text-2xl font-serif font-semibold text-[#e8e4df] tracking-tight">
              Music
            </h1>
          </div>
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 text-sm text-[#888] hover:text-[#e8e4df] transition-colors"
          >
            <Search size={18} />
            <span>搜索</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6">
        {/* Hero Section */}
        <section className="py-16 md:py-24 border-b border-[#1a1a1a]">
          <div className="max-w-2xl">
            <p className="text-sm text-[#888] tracking-wide mb-4">
              {currentSong
                ? `正在播放 · ${currentSong.artists?.map((a: any) => a.name).join(' · ')}`
                : '个人音乐空间'}
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#e8e4df] leading-tight mb-6">
              {currentSong ? (
                <>
                  <span className="text-[#c9a96e]">{currentSong.name}</span>
                </>
              ) : (
                '沉浸在<br />音乐的世界'
              )}
            </h2>
            {!currentSong && (
              <p className="text-[#666] leading-relaxed max-w-lg">
                粘贴网易云音乐分享链接，或从下方选择推荐歌单，开始你的音乐之旅。
              </p>
            )}
          </div>

          {/* Album Art */}
          <div className="mt-12 flex items-center gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-[#1a1a1a] flex items-center justify-center shadow-lg">
              {currentSong?.album?.picUrl ? (
                <img
                  src={currentSong.album.picUrl}
                  alt="cover"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Music2 className="text-[#444]" size={40} />
              )}
            </div>
            {currentSong && (
              <div>
                <div className="text-lg font-medium text-[#e8e4df]">{currentSong.name}</div>
                <div className="text-sm text-[#666] mt-1">
                  {currentSong.artists?.map((a: any) => a.name).join(' · ')}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Share Input Section */}
        <section className="py-12 border-b border-[#1a1a1a]">
          <div className="mb-4">
            <h3 className="text-lg font-serif font-medium text-[#e8e4df]">分享链接</h3>
            <p className="text-sm text-[#666] mt-1">粘贴网易云音乐分享链接，快速播放歌曲或歌单</p>
          </div>
          <ShareInput />
        </section>

        {/* Recommended Playlists */}
        <section className="py-12 border-b border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-[#c9a96e]" />
              <h3 className="text-lg font-serif font-medium text-[#e8e4df]">推荐歌单</h3>
            </div>
          </div>
          {loadingPlaylists ? (
            <div className="flex items-center justify-center py-12 text-[#666]">
              <Loader2 size={20} className="animate-spin mr-3" />
              <span>加载中...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {personalized.map((pl) => (
                <PlaylistCard key={pl.id} playlist={pl} onOpen={openPlaylist} />
              ))}
            </div>
          )}
        </section>

        {/* Charts */}
        <section className="py-12">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp size={18} className="text-[#c9a96e]" />
            <h3 className="text-lg font-serif font-medium text-[#e8e4df]">热门榜单</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {toplists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} onOpen={openPlaylist} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-[#444]">
            基于网易云音乐 API · 仅供个人学习使用
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showSearch && <SearchPanel onClose={() => setShowSearch(false)} />}
      {detailPlaylist && (
        <PlaylistDetail playlist={detailPlaylist} onClose={() => setDetailPlaylist(null)} />
      )}
    </div>
  );
}
