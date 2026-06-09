import { useEffect, useState } from 'react';
import { Search, LogIn, User, Music2, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { api, type Playlist as PlaylistT, type Song, type UserProfile } from '../utils/api';
import { usePlayer } from '../store/playerStore';
import PlaylistCard from '../components/PlaylistCard';
import PlaylistDetail from '../components/PlaylistDetail';
import SearchPanel from '../components/SearchPanel';
import QRLogin from '../components/QRLogin';

export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [myPlaylists, setMyPlaylists] = useState<PlaylistT[]>([]);
  const [favoritePlaylist, setFavoritePlaylist] = useState<PlaylistT | null>(null);
  const [personalized, setPersonalized] = useState<PlaylistT[]>([]);
  const [toplists, setToplists] = useState<PlaylistT[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);

  const [hotSongs, setHotSongs] = useState<Song[]>([]);
  const [loadingHot, setLoadingHot] = useState(false);

  const [detailPlaylist, setDetailPlaylist] = useState<PlaylistT | null>(null);

  const { currentSong, playSong } = usePlayer();

  // 1. 检查登录状态
  useEffect(() => {
    (async () => {
      try {
        const r = await api.loginStatus();
        if (r.data?.profile) {
          setUser(r.data.profile);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoadingStatus(false);
      }
    })();
  }, []);

  // 2. 加载推荐歌单 + 排行榜（未登录也能用）
  useEffect(() => {
    (async () => {
      setLoadingPlaylists(true);
      try {
        const [pRes, tRes] = await Promise.all([api.personalized(12), api.toplist()]);
        setPersonalized(pRes.result || []);
        // 前 4 个热门榜
        setToplists((tRes.list || []).slice(0, 4));
      } catch (e) {
        // ignore
      } finally {
        setLoadingPlaylists(false);
      }
    })();
  }, []);

  // 3. 登录后加载用户歌单 + 我喜欢的音乐
  useEffect(() => {
    if (!user) {
      setMyPlaylists([]);
      setFavoritePlaylist(null);
      setHotSongs([]);
      return;
    }
    (async () => {
      try {
        const plRes = await api.userPlaylist(user.userId);
        const all = plRes.playlist || [];
        // 第一个通常是「我喜欢的音乐」
        if (all.length) {
          const fav = all[0];
          setFavoritePlaylist(fav);
          setMyPlaylists(all.slice(1, 9));
          // 加载这个歌单里前 10 首作为 hotSongs 展示
          setLoadingHot(true);
          try {
            const songsRes = await api.playlistTracks(fav.id, 10, 0);
            setHotSongs(songsRes.songs || []);
          } finally {
            setLoadingHot(false);
          }
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [user]);

  const onLoggedIn = (profile: UserProfile) => {
    setUser(profile);
  };

  const openPlaylist = (pl: PlaylistT) => {
    setDetailPlaylist(pl);
  };

  return (
    <div className="relative min-h-screen pb-40">
      {/* 背景光晕 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-pink-500/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 px-4 md:px-10 py-4">
        <div className="glass rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-vibes flex items-center justify-center shadow-glow">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg display-font font-bold text-gradient-vibes leading-none">
                Music
              </div>
              <div className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">
                your personal sound
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm text-white/70 transition"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">搜索歌曲…</span>
            </button>

            {loadingStatus ? (
              <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
                <img
                  src={user.avatarUrl}
                  alt={user.nickname}
                  className="w-7 h-7 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden md:block text-xs max-w-[10rem] truncate text-white/80">
                  {user.nickname}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-semibold hover:scale-105 transition"
              >
                <LogIn className="w-4 h-4" /> 登录
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 md:px-10 pt-6 md:pt-10 animate-rise-in">
        <div className="glass rounded-3xl p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-vibes opacity-20 blur-3xl rounded-full" />
          <div className="relative grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 md:col-span-7">
              <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> NOW PLAYING · 你的专属电台
              </div>
              <h1 className="text-4xl md:text-6xl display-font font-bold leading-tight">
                {currentSong ? (
                  <span className="text-gradient-vibes">{currentSong.name}</span>
                ) : (
                  <>
                    <span className="text-white">沉浸于</span>
                    <br />
                    <span className="text-gradient-vibes">你的音乐宇宙</span>
                  </>
                )}
              </h1>
              {currentSong ? (
                <p className="mt-4 text-white/60 text-base md:text-lg">
                  {currentSong.artists?.map((a: any) => a.name).join(' · ') || ''}
                </p>
              ) : (
                <p className="mt-4 text-white/60 max-w-lg text-sm md:text-base leading-relaxed">
                  从网易云同步你的歌单、搜索心仪歌曲，点击即播。
                  {!user && '登录后可加载「我喜欢的音乐」及个性化推荐。'}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {!user && (
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:scale-105 transition"
                  >
                    使用网易云扫码登录
                  </button>
                )}
                <button
                  onClick={() => setShowSearch(true)}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-sm font-semibold transition"
                >
                  搜索一首歌
                </button>
              </div>
            </div>

            <div className="col-span-12 md:col-span-5 flex justify-center md:justify-end">
              <div className="relative w-48 h-48 md:w-56 md:h-56">
                <div className="absolute inset-0 rounded-full bg-gradient-vibes opacity-60 blur-2xl animate-pulse-soft" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-[6px] border-black/50 shadow-glow bg-gradient-vibes flex items-center justify-center">
                  {currentSong?.album?.picUrl ? (
                    <img
                      src={currentSong.album.picUrl}
                      alt="cover"
                      className="w-full h-full object-cover animate-spin-slow"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Music2 className="w-20 h-20 text-white/90" />
                  )}
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black border-2 border-white/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 我喜欢的音乐 */}
      {user && favoritePlaylist && (
        <section className="px-4 md:px-10 mt-12 animate-rise-in">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-white/50 tracking-widest uppercase mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-pink-400" /> FAVORITES · 我喜欢
              </div>
              <h2 className="text-3xl md:text-4xl display-font font-bold text-gradient-vibes">
                {favoritePlaylist.name}
              </h2>
            </div>
            <button
              onClick={() => openPlaylist(favoritePlaylist)}
              className="text-sm text-white/50 hover:text-white transition"
            >
              查看全部 →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 大卡片：歌单入口 */}
            <PlaylistCard
              playlist={favoritePlaylist}
              isFavorite
              onOpen={openPlaylist}
            />
            {/* 右侧两列：歌曲列表 */}
            <div className="md:col-span-2 glass rounded-2xl p-3 md:p-4">
              {loadingHot ? (
                <div className="flex items-center justify-center py-10 text-white/50 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> 加载歌曲…
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-white/5">
                  {hotSongs.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => playSong(s, hotSongs)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition text-left group"
                    >
                      <div className="w-6 text-xs text-white/40 tabular-nums text-right">{idx + 1}</div>
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
                        {s.album?.picUrl ? (
                          <img
                            src={s.album.picUrl}
                            alt="cover"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Music2 className="w-3.5 h-3.5 text-white/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm text-white group-hover:text-gradient-vibes">
                          {s.name}
                        </div>
                        <div className="truncate text-xs text-white/50">
                          {s.artists?.map((a) => a.name).join(' / ')}
                        </div>
                      </div>
                    </button>
                  ))}
                  {hotSongs.length === 0 && (
                    <div className="py-6 text-center text-sm text-white/40">暂无歌曲</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 我的其他歌单 */}
      {user && myPlaylists.length > 0 && (
        <section className="px-4 md:px-10 mt-12 animate-rise-in">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="text-xs text-white/50 tracking-widest uppercase mb-1">MY PLAYLISTS</div>
              <h2 className="text-2xl md:text-3xl display-font font-bold">我的歌单</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {myPlaylists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} onOpen={openPlaylist} />
            ))}
          </div>
        </section>
      )}

      {/* 推荐歌单 */}
      <section className="px-4 md:px-10 mt-12 animate-rise-in">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/50 tracking-widest uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> RECOMMENDED
            </div>
            <h2 className="text-2xl md:text-3xl display-font font-bold">为你推荐</h2>
          </div>
        </div>
        {loadingPlaylists ? (
          <div className="flex items-center justify-center py-10 text-white/50 text-sm">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> 正在加载推荐歌单…
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {personalized.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} onOpen={openPlaylist} />
            ))}
          </div>
        )}
      </section>

      {/* 排行榜 */}
      <section className="px-4 md:px-10 mt-12 pb-8 animate-rise-in">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/50 tracking-widest uppercase mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> CHARTS
            </div>
            <h2 className="text-2xl md:text-3xl display-font font-bold">热门榜单</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {toplists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} onOpen={openPlaylist} />
          ))}
        </div>
      </section>

      {/* 未登录提示 */}
      {!user && !loadingStatus && (
        <section className="px-4 md:px-10 mt-12 animate-rise-in">
          <div className="glass rounded-3xl p-6 md:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-vibes opacity-10" />
            <div className="relative">
              <User className="w-10 h-10 mx-auto text-white/60 mb-3" />
              <h3 className="text-2xl display-font font-bold text-white mb-2">登录解锁更多</h3>
              <p className="text-sm text-white/60 max-w-md mx-auto mb-5">
                使用网易云 App 扫码登录，即可加载「我喜欢的音乐」、我的歌单及个性化推荐，点击即播。
              </p>
              <button
                onClick={() => setShowLogin(true)}
                className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition"
              >
                立即扫码登录
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 弹窗层 */}
      {showLogin && (
        <QRLogin onClose={() => setShowLogin(false)} onLoggedIn={onLoggedIn} />
      )}
      {showSearch && <SearchPanel onClose={() => setShowSearch(false)} />}
      {detailPlaylist && (
        <PlaylistDetail playlist={detailPlaylist} onClose={() => setDetailPlaylist(null)} />
      )}
    </div>
  );
}
