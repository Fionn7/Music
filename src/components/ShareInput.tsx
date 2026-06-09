import { useState } from 'react';
import { Link2, Loader2, Play, ListMusic, Disc } from 'lucide-react';
import { api, type Playlist, type Song } from '../utils/api';
import { usePlayer } from '../store/playerStore';

interface ShareInputProps {
  onParsed?: (data: { type: string; data: any }) => void;
}

export default function ShareInput({ onParsed }: ShareInputProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState<{ type: string; data: any } | null>(null);
  const { playSong } = usePlayer();

  const handleParse = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setParsed(null);

    try {
      const res = await api.parseShare(url.trim());
      if (res.success) {
        setParsed(res);
        onParsed?.(res);

        // 如果是歌曲，自动播放
        if (res.type === 'song') {
          const song = res.data as Song;
          if (song.id) {
            const urlRes = await api.songUrl(song.id);
            if (urlRes.success && urlRes.data?.[0]?.url) {
              await playSong(song, [song]);
            }
          }
        }
      } else {
        setError('解析失败，请检查链接是否正确');
      }
    } catch (e: any) {
      setError(e.message || '解析失败');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleParse();
    }
  };

  const handlePlayPlaylist = async (pl: Playlist) => {
    try {
      const tracksRes = await api.playlistTracks(pl.id, 50, 0);
      if (tracksRes.songs?.length) {
        await playSong(tracksRes.songs[0], tracksRes.songs);
      }
    } catch {
      setError('加载歌曲失败');
    }
  };

  return (
    <div className="share-input-container">
      <div className="share-input-row">
        <Link2 className="share-input-icon" size={18} />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="粘贴网易云分享链接，如 https://music.163.com/song?id=123456"
          className="share-input"
        />
        <button
          onClick={handleParse}
          disabled={loading || !url.trim()}
          className="share-submit"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : '解析'}
        </button>
      </div>

      {error && <div className="share-error">{error}</div>}

      {parsed && (
        <div className="share-result">
          {parsed.type === 'song' && (
            <div className="share-song">
              <div className="share-song-cover">
                {parsed.data.album?.picUrl ? (
                  <img src={parsed.data.album.picUrl} alt="cover" referrerPolicy="no-referrer" />
                ) : (
                  <Disc size={32} />
                )}
              </div>
              <div className="share-song-info">
                <div className="share-song-name">{parsed.data.name}</div>
                <div className="share-song-artist">
                  {parsed.data.artists?.map((a: any) => a.name).join(' / ')}
                </div>
              </div>
              <button
                onClick={async () => {
                  const song = parsed.data as Song;
                  const urlRes = await api.songUrl(song.id);
                  if (urlRes.success && urlRes.data?.[0]?.url) {
                    await playSong(song, [song]);
                  }
                }}
                className="share-play-btn"
              >
                <Play size={18} />
              </button>
            </div>
          )}

          {parsed.type === 'playlist' && (
            <div className="share-playlist">
              <div className="share-playlist-cover">
                {parsed.data.coverImgUrl ? (
                  <img src={parsed.data.coverImgUrl} alt="cover" referrerPolicy="no-referrer" />
                ) : (
                  <ListMusic size={32} />
                )}
              </div>
              <div className="share-playlist-info">
                <div className="share-playlist-name">{parsed.data.name}</div>
                <div className="share-playlist-count">
                  {parsed.data.trackCount || 0} 首歌曲
                </div>
              </div>
              <button onClick={() => handlePlayPlaylist(parsed.data)} className="share-play-btn">
                <Play size={18} />
              </button>
            </div>
          )}

          {parsed.type === 'album' && (
            <div className="share-album">
              <div className="share-album-info">
                <div className="share-album-title">专辑：{parsed.data.name || '未知专辑'}</div>
                <div className="share-album-count">
                  {parsed.data.tracks?.length || 0} 首歌曲
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
