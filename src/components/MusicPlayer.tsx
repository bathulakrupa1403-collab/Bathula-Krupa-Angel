import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Track, TRACKS } from '../types';

interface MusicPlayerProps {
  currentTrackIndex: number;
  onTrackChange: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export default function MusicPlayer({ 
  currentTrackIndex, 
  onTrackChange, 
  isPlaying, 
  setIsPlaying 
}: MusicPlayerProps) {
  const track = TRACKS[currentTrackIndex];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const skip = (direction: 'next' | 'prev') => {
    let nextIndex = direction === 'next' ? currentTrackIndex + 1 : currentTrackIndex - 1;
    if (nextIndex >= TRACKS.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = TRACKS.length - 1;
    onTrackChange(nextIndex);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md hardware-panel p-8 relative overflow-hidden">
      {/* Hardware Accents */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <div className="w-12 h-12 border-t border-r border-white" />
      </div>
      
      <audio 
        ref={audioRef}
        src={track.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => skip('next')}
      />

      {/* Track Info Section */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex items-center justify-between">
          <span className="micro-label">Audio Source: {track.id.padStart(2, '0')}</span>
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`w-1 h-1 rounded-full ${isPlaying ? 'bg-neon-lime animate-pulse' : 'bg-white/10'}`} style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <motion.div 
            key={track.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-28 h-28 flex-shrink-0 group"
          >
            <img 
              src={track.cover} 
              alt={track.title}
              className="w-full h-full object-cover rounded-lg grayscale hover:grayscale-0 transition-all duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 border border-white/10 rounded-lg group-hover:border-white/30 transition-colors" />
            <div 
              className="absolute -inset-1 blur-md opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ backgroundColor: track.color }}
            />
          </motion.div>

          <div className="flex-1 min-w-0">
            <motion.div
              key={`meta-${track.id}`}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <h3 className="text-2xl font-black tracking-tighter mb-1 truncate uppercase italic">
                {track.title}
              </h3>
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.3em]">
                {track.artist}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-10">
        <div className="flex justify-between mb-3">
          <span className="micro-label">Signal Progress</span>
          <span className="font-mono text-[10px] text-white/60">
            {formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}
          </span>
        </div>
        
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden cursor-pointer group relative">
          <motion.div 
            className="h-full relative z-10"
            style={{ 
              width: `${progress}%`, 
              backgroundColor: track.color,
              boxShadow: `0 0 15px ${track.color}`
            }}
          />
          {/* Background Grid for Progress */}
          <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-[1px] h-full bg-white/10" />
            ))}
          </div>
        </div>
      </div>

      {/* Control Interface */}
      <div className="grid grid-cols-3 items-center">
        <div className="flex flex-col gap-2">
          <span className="micro-label">Volume</span>
          <div className="flex items-center gap-2">
            <Volume2 size={12} className="text-white/40" />
            <div className="flex-1 h-[2px] bg-white/10 rounded-full">
              <div className="w-2/3 h-full bg-white/40 rounded-full" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => skip('prev')}
            className="p-2 text-white/40 hover:text-white transition-colors hover:scale-110 active:scale-90"
          >
            <SkipBack size={20} />
          </button>

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-white/10 bg-white/5 hover:bg-white/10 group"
          >
            <div 
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity"
              style={{ backgroundColor: track.color }}
            />
            {isPlaying ? (
              <Pause size={24} className="text-white" />
            ) : (
              <Play size={24} className="text-white ml-1" />
            )}
          </button>

          <button 
            onClick={() => skip('next')}
            className="p-2 text-white/40 hover:text-white transition-colors hover:scale-110 active:scale-90"
          >
            <SkipForward size={20} />
          </button>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="micro-label">Output</span>
          <div className="px-2 py-1 border border-white/10 rounded font-mono text-[8px] text-white/40 tracking-widest">
            STEREO_24B
          </div>
        </div>
      </div>
    </div>
  );
}
