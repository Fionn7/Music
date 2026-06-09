// 网易云音乐 API 调用封装
const base = '/api';

async function get<T = any>(path: string, params?: Record<string, any>): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

export interface Song {
  id: number;
  name: string;
  artists: { id: number; name: string }[];
  album: { id: number; name: string; picUrl: string };
  duration: number;
  url?: string;
}

export interface Playlist {
  id: number;
  name: string;
  coverImgUrl: string;
  description?: string;
  playCount?: number;
  trackCount?: number;
}

export interface UserProfile {
  userId: number;
  nickname: string;
  avatarUrl: string;
  signature?: string;
}

export const api = {
  // 登录
  qrKey: () => get<{ success: boolean; unikey: string }>('/api/qr/key'),
  // 后端仅返回 qrurl；前端用 qrcode 库在浏览器端生成图片
  qrCreate: (key: string) => get<{ success: boolean; qrurl: string; qrimg?: string }>('/api/qr/create', { key }),
  qrCheck: (key: string) => get<{ success: boolean; code: number; message?: string; cookie?: string }>('/api/qr/check', { key }),
  loginStatus: () =>
    get<{
      success: boolean;
      data: { profile?: UserProfile; account?: any; code?: number };
    }>('/api/login/status'),

  // 歌单
  userPlaylist: (uid?: string | number) =>
    get<{ success: boolean; playlist: Playlist[] }>('/api/user/playlist', { uid }),
  playlistDetail: (id: string | number) =>
    get<{ success: boolean; data: Playlist & { trackIds: { id: number }[] } }>('/api/playlist/detail', { id }),
  playlistTracks: (id: string | number, limit = 200, offset = 0) =>
    get<{ success: boolean; songs: Song[] }>('/api/playlist/track/all', { id, limit, offset }),

  // 歌曲
  songUrl: (id: string | number) =>
    get<{ success: boolean; data: { id: number; url: string; br: number }[] }>('/api/song/url', { id }),
  songDetail: (ids: string) => get<{ success: boolean; songs: Song[] }>('/api/song/detail', { ids }),

  // 搜索
  search: (keywords: string, limit = 30) =>
    get<{ success: boolean; result: { songs: Song[] } }>('/api/search', { keywords, limit, type: 1 }),

  // 推荐 / 排行榜
  personalized: (limit = 12) =>
    get<{ success: boolean; result: Playlist[] }>('/api/personalized', { limit }),
  toplist: () => get<{ success: boolean; list: Playlist[] }>('/api/toplist'),

  // 歌词
  lyric: (id: string | number) =>
    get<{ success: boolean; lrc?: { lyric: string }; klyric?: { lyric: string } }>('/api/lyric', { id }),

  // 解析分享 URL
  parseShare: (url: string) =>
    get<{ success: boolean; type: 'song' | 'playlist' | 'album'; data: any }>('/api/parse/share', { url }),
};

export const formatDuration = (ms: number) => {
  if (!ms || ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const formatCurrentTime = (sec: number) => {
  const total = Math.floor(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};
