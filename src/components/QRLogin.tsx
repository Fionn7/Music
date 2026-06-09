import { useEffect, useState } from 'react';
import { X, Check, Loader2, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import { api, type UserProfile } from '../utils/api';

interface Props {
  onClose: () => void;
  onLoggedIn: (profile: UserProfile) => void;
}

export default function QRLogin({ onClose, onLoggedIn }: Props) {
  const [qrimg, setQrimg] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [status, setStatus] = useState<
    'loading' | 'waiting' | 'scanned' | 'expired' | 'success' | 'error'
  >('loading');
  const [message, setMessage] = useState('生成二维码中…');

  const initQr = async () => {
    setStatus('loading');
    setMessage('生成二维码中…');
    setQrimg(null);
    try {
      // 1. 获取 key
      const keyRes = await api.qrKey();
      const k = keyRes.unikey;
      if (!k) throw new Error('无法获取 key');
      setKey(k);

      // 2. 获取二维码 URL
      const qrRes = await api.qrCreate(k);
      const qrurl = qrRes.qrurl;
      if (!qrurl) throw new Error('无法获取二维码 URL');

      // 3. 在浏览器端用 qrcode 库生成图片
      const dataUrl = await QRCode.toDataURL(qrurl, {
        width: 320,
        margin: 1,
        color: { dark: '#000', light: '#fff' },
        errorCorrectionLevel: 'M',
      });
      setQrimg(dataUrl);
      setStatus('waiting');
      setMessage('请使用网易云音乐 App 扫码登录');
    } catch (e: any) {
      console.error('QR login init error:', e);
      setStatus('error');
      setMessage('生成失败，点击刷新重试');
    }
  };

  useEffect(() => {
    initQr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 轮询扫码状态
  useEffect(() => {
    if (!key || status === 'success' || status === 'expired' || status === 'error') return;
    const t = setInterval(async () => {
      try {
        const r = await api.qrCheck(key);
        // 801 等待扫码, 802 已扫码未确认, 803 确认成功, 800 过期
        if (r.code === 803) {
          setStatus('success');
          setMessage('登录成功，加载用户信息…');
          // 获取用户信息
          try {
            const statusRes = await api.loginStatus();
            if (statusRes?.data?.profile) {
              onLoggedIn(statusRes.data.profile);
            }
          } catch (e) {
            // 登录状态查询失败不影响整体，profile 为空
          }
          clearInterval(t);
          setTimeout(() => onClose(), 1000);
        } else if (r.code === 802) {
          setStatus('scanned');
          setMessage('已扫码，请在 App 中确认');
        } else if (r.code === 800) {
          setStatus('expired');
          setMessage('二维码已过期，点击刷新');
          clearInterval(t);
        } else {
          setStatus('waiting');
        }
      } catch (e) {
        // 忽略网络波动
      }
    }, 2000);
    return () => clearInterval(t);
  }, [key, status, onLoggedIn, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-rise-in">
      <div className="glass rounded-3xl p-6 md:p-8 max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition"
          aria-label="close"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl display-font text-center mb-2 text-gradient-vibes">
          登录网易云
        </h2>
        <p className="text-center text-sm text-white/60 mb-6">{message}</p>

        <div className="flex justify-center">
          <div className="relative w-52 h-52 bg-white rounded-2xl p-3 flex items-center justify-center overflow-hidden">
            {status === 'loading' && (
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            )}
            {status !== 'loading' && qrimg && (
              <img
                src={qrimg}
                alt="扫码登录"
                className={`w-full h-full object-contain ${
                  status === 'expired' || status === 'error' ? 'opacity-30 grayscale' : ''
                } ${status === 'success' ? 'opacity-40' : ''}`}
              />
            )}
            {status === 'success' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
                <Check className="w-12 h-12 text-green-500" />
                <span className="mt-2 text-sm text-black font-semibold">登录成功</span>
              </div>
            )}
            {(status === 'expired' || status === 'error') && (
              <button
                onClick={initQr}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 text-black text-sm font-semibold hover:bg-black/20 transition"
              >
                <RefreshCw className="w-8 h-8 mb-2" />
                点击刷新
              </button>
            )}
            {status === 'scanned' && (
              <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-black/70 bg-white/80 py-1">
                请在手机 App 中点击确认
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-white/40 mt-6 leading-relaxed">
          扫码后即可加载「我喜欢的音乐」
          <br />
          及个性化推荐歌单
        </p>
      </div>
    </div>
  );
}
