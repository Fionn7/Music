/**
 * 网易云音乐 API 代理服务器
 * - QR 码登录
 * - 我喜欢的音乐歌单
 * - 歌曲搜索、详情、播放 URL、歌词
 * - 推荐歌单、热门歌曲
 */
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// @ts-ignore - CJS 命名导出在 ESM 加载器中不可用
import NeteaseCloudMusicApi from 'NeteaseCloudMusicApi';

const {
  login_qr_key,
  login_qr_create,
  login_qr_check,
  login_status,
  user_playlist,
  playlist_detail,
  playlist_track_all,
  song_url_v1,
  song_detail,
  search,
  lyric,
  personalized,
  toplist,
  // @ts-ignore
} = NeteaseCloudMusicApi;

dotenv.config();

const app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(express.json({ limit: '10mb' }));

// 存放全局 cookie (服务端共享登录态)
let globalCookie: string | undefined = undefined;

const nc = async (fn: any, params: any = {}) => {
  try {
    const result: any = await fn({
      ...params,
      cookie: globalCookie,
      realIP: '118.88.88.88',
    });
    // 保存响应中的 cookie 以维持登录态
    if (result && result.cookie) {
      if (Array.isArray(result.cookie)) {
        globalCookie = result.cookie.join('; ');
      } else {
        globalCookie = String(result.cookie);
      }
    }
    if (result && result.body) {
      return result.body;
    }
    return result;
  } catch (err: any) {
    console.error('[Netease API error]', err?.message || err);
    throw err;
  }
};

// ============ 登录相关 ============

// 1. 获取 QR key
app.get('/api/qr/key', async (_req: Request, res: Response) => {
  try {
    const data: any = await nc(login_qr_key, {});
    res.json({ success: true, unikey: data?.unikey || data?.data?.unikey });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. 根据 key 生成二维码图片 (base64)
app.get('/api/qr/create', async (req: Request, res: Response) => {
  try {
    const { key } = req.query;
    const data: any = await nc(login_qr_create, { key, qrimg: true });
    res.json({ success: true, qrimg: data?.qrimg || data?.data?.qrimg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. 检查扫码状态
app.get('/api/qr/check', async (req: Request, res: Response) => {
  try {
    const { key } = req.query;
    const data: any = await nc(login_qr_check, { key });
    // 801 等待  802 扫码中  803 确认(登录成功)  800 过期
    res.json({ success: true, ...data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. 当前登录状态
app.get('/api/login/status', async (_req: Request, res: Response) => {
  try {
    const data: any = await nc(login_status, {});
    res.json({ success: true, data: data?.data || data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============ 音乐相关 ============

// 获取用户歌单 (uid 为空则取登录用户)
app.get('/api/user/playlist', async (req: Request, res: Response) => {
  try {
    const { uid } = req.query;
    const data: any = await nc(user_playlist, { uid });
    res.json({ success: true, playlist: data?.playlist || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 歌单详情
app.get('/api/playlist/detail', async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const data: any = await nc(playlist_detail, { id });
    res.json({ success: true, data: data?.playlist || data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 歌单全部歌曲
app.get('/api/playlist/track/all', async (req: Request, res: Response) => {
  try {
    const { id, limit = 50, offset = 0 } = req.query;
    const data: any = await nc(playlist_track_all, {
      id,
      limit: Number(limit),
      offset: Number(offset),
    });
    res.json({ success: true, songs: data?.songs || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 歌曲播放 URL
app.get('/api/song/url', async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const data: any = await nc(song_url_v1, { id });
    res.json({ success: true, data: data?.data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 歌曲详情
app.get('/api/song/detail', async (req: Request, res: Response) => {
  try {
    const { ids } = req.query;
    const data: any = await nc(song_detail, { ids });
    res.json({ success: true, songs: data?.songs || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 搜索
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const { keywords, limit = 30, type = 1 } = req.query;
    const data: any = await nc(search, {
      keywords,
      limit: Number(limit),
      type: Number(type),
    });
    res.json({ success: true, result: data?.result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 歌词
app.get('/api/lyric', async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const data: any = await nc(lyric, { id });
    res.json({ success: true, ...data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 推荐歌单
app.get('/api/personalized', async (req: Request, res: Response) => {
  try {
    const { limit = 12 } = req.query;
    const data: any = await nc(personalized, { limit: Number(limit) });
    res.json({ success: true, result: data?.result || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 排行榜
app.get('/api/toplist', async (_req: Request, res: Response) => {
  try {
    const data: any = await nc(toplist, {});
    res.json({ success: true, list: data?.list || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'ok' });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `API not found: ${req.path}` });
});

export default app;
