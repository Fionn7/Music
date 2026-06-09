/**
 * 网易云音乐 API 代理服务器
 * - QR 码登录（使用 Set-Cookie 将会话下发到浏览器持久化）
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
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(express.json({ limit: '10mb' }));

/**
 * 从请求 headers 中解析出 cookie 字符串
 * 用浏览器端持久化的 Cookie 替代服务端内存 globalCookie，
 * 以支持 serverless / workers 等无状态部署环境。
 */
function getClientCookie(req: Request): string {
  const cookieHeader = req.headers.cookie || '';
  // 合并 _ncm_ 前缀的 cookie + 原 cookie header
  const ncmCookies: string[] = [];
  if (cookieHeader) {
    cookieHeader.split(';').forEach((c) => {
      const trimmed = c.trim();
      if (trimmed) ncmCookies.push(trimmed);
    });
  }
  return ncmCookies.join('; ');
}

/**
 * 将网易云返回的 cookie 下发到浏览器端
 */
function forwardCookies(res: Response, cookie: string | string[] | undefined) {
  if (!cookie) return;
  const list: string[] = Array.isArray(cookie) ? cookie : [String(cookie)];
  list.forEach((c) => {
    // 只取 "name=value" 部分
    const firstSemi = c.indexOf(';');
    const nv = firstSemi >= 0 ? c.slice(0, firstSemi) : c;
    if (!nv.trim()) return;
    const eqIdx = nv.indexOf('=');
    if (eqIdx < 0) return;
    const name = nv.slice(0, eqIdx).trim();
    const value = nv.slice(eqIdx + 1).trim();
    if (!name) return;
    res.cookie(name, value, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 天
    });
  });
}

/**
 * 统一的网易云 API 调用器
 */
async function nc(
  fn: any,
  params: any = {},
  req: Request,
  res: Response
): Promise<any> {
  const clientCookie = getClientCookie(req);
  const result: any = await fn({
    ...params,
    cookie: clientCookie || undefined,
    realIP: '118.88.88.88',
  });
  if (result && result.cookie) {
    forwardCookies(res, result.cookie);
  }
  if (result && result.body) {
    return result.body;
  }
  return result;
}

// ============ 登录相关 ============

// 1. 获取 QR key
app.get('/api/qr/key', async (req: Request, res: Response) => {
  try {
    const data: any = await nc(login_qr_key, {}, req, res);
    const unikey = data?.data?.unikey || data?.unikey;
    res.json({ success: true, unikey });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. 根据 key 生成二维码 URL（不再在服务器端生成 qrimg canvas）
app.get('/api/qr/create', async (req: Request, res: Response) => {
  try {
    const { key } = req.query;
    // 只调用 qrimg:false，获取纯 URL，避免服务器端 canvas 依赖
    const data: any = await nc(login_qr_create, { key }, req, res);
    const qrurl = data?.data?.qrurl || data?.qrurl || '';
    res.json({ success: true, qrurl });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. 检查扫码状态
app.get('/api/qr/check', async (req: Request, res: Response) => {
  try {
    const { key } = req.query;
    const data: any = await nc(login_qr_check, { key }, req, res);
    // 801 等待  802 扫码中  803 确认(登录成功)  800 过期
    res.json({ success: true, ...data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. 当前登录状态
app.get('/api/login/status', async (req: Request, res: Response) => {
  try {
    const data: any = await nc(login_status, {}, req, res);
    res.json({ success: true, data: data?.data || data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============ 音乐相关 ============

// 获取用户歌单
app.get('/api/user/playlist', async (req: Request, res: Response) => {
  try {
    const { uid } = req.query;
    const data: any = await nc(user_playlist, { uid }, req, res);
    res.json({ success: true, playlist: data?.playlist || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 歌单详情
app.get('/api/playlist/detail', async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const data: any = await nc(playlist_detail, { id }, req, res);
    res.json({ success: true, data: data?.playlist || data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 歌单全部歌曲
app.get('/api/playlist/track/all', async (req: Request, res: Response) => {
  try {
    const { id, limit = 50, offset = 0 } = req.query;
    const data: any = await nc(
      playlist_track_all,
      {
        id,
        limit: Number(limit),
        offset: Number(offset),
      },
      req,
      res
    );
    res.json({ success: true, songs: data?.songs || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 歌曲播放 URL
app.get('/api/song/url', async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const data: any = await nc(song_url_v1, { id }, req, res);
    res.json({ success: true, data: data?.data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 歌曲详情
app.get('/api/song/detail', async (req: Request, res: Response) => {
  try {
    const { ids } = req.query;
    const data: any = await nc(song_detail, { ids }, req, res);
    res.json({ success: true, songs: data?.songs || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 搜索
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const { keywords, limit = 30, type = 1 } = req.query;
    const data: any = await nc(
      search,
      { keywords, limit: Number(limit), type: Number(type) },
      req,
      res
    );
    res.json({ success: true, result: data?.result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 歌词
app.get('/api/lyric', async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const data: any = await nc(lyric, { id }, req, res);
    res.json({ success: true, ...data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 推荐歌单
app.get('/api/personalized', async (req: Request, res: Response) => {
  try {
    const { limit = 12 } = req.query;
    const data: any = await nc(personalized, { limit: Number(limit) }, req, res);
    res.json({ success: true, result: data?.result || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 排行榜
app.get('/api/toplist', async (req: Request, res: Response) => {
  try {
    const data: any = await nc(toplist, {}, req, res);
    res.json({ success: true, list: data?.list || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'ok' });
});

// 解析网易云分享 URL
app.get('/api/parse/share', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, error: 'Missing url parameter' });
      return;
    }

    // 解析 URL 提取类型和 ID
    let id: string = '';
    let type: 'song' | 'playlist' | 'album' = 'song';

    try {
      const parsed = new URL(url);
      const path = parsed.pathname;

      if (path.includes('/song/')) {
        type = 'song';
        // 处理 /song/{id} 格式
        const match = path.match(/\/song\/(\d+)/);
        id = match ? match[1] : parsed.searchParams.get('id') || '';
      } else if (path.includes('/playlist/')) {
        type = 'playlist';
        const match = path.match(/\/playlist\/(\d+)/);
        id = match ? match[1] : parsed.searchParams.get('id') || '';
      } else if (path.includes('/album/')) {
        type = 'album';
        const match = path.match(/\/album\/(\d+)/);
        id = match ? match[1] : parsed.searchParams.get('id') || '';
      } else {
        // fallback: 从 searchParams 获取 id
        id = parsed.searchParams.get('id') || '';
        if (id) {
          // 根据是否有 song 关键字判断
          type = url.includes('song') ? 'song' : url.includes('playlist') ? 'playlist' : 'album';
        }
      }
    } catch {
      // URL 解析失败，尝试从字符串中提取 id
      const idMatch = url.match(/[?&]id=(\d+)/) || url.match(/\/(\d+)$/);
      if (idMatch) {
        id = idMatch[1];
        type = url.includes('playlist') ? 'playlist' : url.includes('album') ? 'album' : 'song';
      }
    }

    if (!id) {
      res.status(400).json({ success: false, error: 'Invalid URL: cannot extract id' });
      return;
    }

    // 根据类型获取详细信息
    if (type === 'song') {
      const data: any = await nc(song_detail, { ids: id }, req, res);
      const songs = data?.songs || [];
      if (songs.length > 0) {
        res.json({ success: true, type: 'song', data: songs[0] });
      } else {
        res.status(404).json({ success: false, error: 'Song not found' });
      }
    } else if (type === 'playlist') {
      const data: any = await nc(playlist_detail, { id }, req, res);
      res.json({ success: true, type: 'playlist', data: data?.playlist || data });
    } else if (type === 'album') {
      // 专辑使用 playlist_track_all 或专用专辑接口
      const data: any = await nc(playlist_track_all, { id, limit: 50 }, req, res);
      res.json({ success: true, type: 'album', data: { tracks: data?.songs || [] } });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `API not found: ${req.path}` });
});

export default app;
