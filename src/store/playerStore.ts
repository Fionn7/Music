import { create } from 'zustand';
import type { Song } from '../utils/api';
import { api } from '../utils/api';

interface PlayerState {
  currentSong: Song | null;
  currentUrl: string | null;
  playlist: Song[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;

  playSong: (song: Song, playlist?: Song[]) => Promise<void>;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setPlaying: (p: boolean) => void;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  currentSong: null,
  currentUrl: null,
  playlist: [],
  currentIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,

  playSong: async (song, playlist) => {
    try {
      const res = await api.songUrl(song.id);
      const urlItem = res.data?.[0];
      if (!urlItem?.url) {
        console.warn('No playable URL for', song.name);
        // 仍播放队列切换但不播
        set({
          currentSong: song,
          currentUrl: null,
          playlist: playlist || get().playlist,
          currentIndex: playlist ? playlist.findIndex((s) => s.id === song.id) : 0,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
        });
        return;
      }
      const newPlaylist = playlist || get().playlist;
      const idx = playlist
        ? playlist.findIndex((s) => s.id === song.id)
        : get().currentIndex;
      set({
        currentSong: song,
        currentUrl: urlItem.url,
        playlist: newPlaylist,
        currentIndex: idx >= 0 ? idx : 0,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      });
    } catch (err) {
      console.error('playSong error', err);
    }
  },

  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaying: (p) => set({ isPlaying: p }),

  next: () => {
    const { playlist, currentIndex, playSong } = get();
    if (!playlist.length) return;
    const nextIdx = (currentIndex + 1) % playlist.length;
    playSong(playlist[nextIdx], playlist);
  },

  prev: () => {
    const { playlist, currentIndex, playSong } = get();
    if (!playlist.length) return;
    const prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
    playSong(playlist[prevIdx], playlist);
  },

  seek: (t) => set({ currentTime: t }),
  setVolume: (v) => set({ volume: v }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
}));
