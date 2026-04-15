/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { TRACKS } from './types';

export default function App() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="relative min-h-screen w-full bg-dark-bg flex flex-col items-center justify-center overflow-hidden">
      {/* Atmospheric Background (Recipe 7) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 100, 0],
            y: [0, -100, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-[160px]"
          style={{ backgroundColor: `${currentTrack.color}15` }}
        />
        <motion.div 
          animate={{ 
            scale: [1.4, 1, 1.4],
            opacity: [0.1, 0.3, 0.1],
            x: [0, -80, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-[160px]"
          style={{ backgroundColor: `${currentTrack.color}08` }}
        />
        {/* Scanning Line Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.02)_50%)] bg-[length:100%_4px] pointer-events-none" />
      </div>

      {/* Main Content (Recipe 11: Split Layout feel) */}
      <main className="relative z-10 w-full max-w-7xl px-8 py-12 flex flex-col lg:grid lg:grid-cols-[1fr_2fr_1fr] items-center gap-16">
        
        {/* Left Side: Branding (Recipe 2: Editorial) */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-7xl font-black tracking-tighter leading-[0.85] mb-4 italic uppercase">
              NEON<br />
              <span style={{ color: currentTrack.color, textShadow: `0 0 30px ${currentTrack.color}44` }} className="transition-all duration-700">
                BEATS
              </span>
            </h1>
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="h-[1px] w-8 bg-white/20" />
              <p className="micro-label opacity-60">Neural Interface v2.4</p>
            </div>
          </motion.div>

          <div className="hidden lg:block space-y-8">
            <div className="space-y-2">
              <span className="micro-label">Current Node</span>
              <p className="font-mono text-xs text-white/40">AS-7719-BETA</p>
            </div>
            <div className="space-y-2">
              <span className="micro-label">Encryption</span>
              <p className="font-mono text-xs text-white/40">AES-256-GCM</p>
            </div>
          </div>
        </div>

        {/* Center: Snake Game */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="w-full flex justify-center"
        >
          <SnakeGame accentColor={currentTrack.color} />
        </motion.div>

        {/* Right Side: Music Player */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full"
        >
          <MusicPlayer 
            currentTrackIndex={currentTrackIndex}
            onTrackChange={setCurrentTrackIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        </motion.div>
      </main>

      {/* Footer Decoration */}
      <div className="absolute bottom-10 left-10 hidden lg:flex items-center gap-6 opacity-30">
        <span className="micro-label">© 2026 NEON_CORP</span>
        <div className="h-[1px] w-12 bg-white/20" />
        <span className="micro-label">All Rights Reserved</span>
      </div>
      
      <div className="absolute bottom-10 right-10 hidden lg:flex items-center gap-4 opacity-30">
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1 h-4 bg-white/40" />
          ))}
        </div>
        <span className="micro-label tracking-[0.4em]">Secure Connection</span>
      </div>
    </div>
  );
}
