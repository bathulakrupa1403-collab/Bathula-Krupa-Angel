import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Point, Direction } from '../types';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION: Direction = 'UP';
const INITIAL_SPEED = 90;

interface SnakeGameProps {
  accentColor: string;
}

export default function SnakeGame({ accentColor }: SnakeGameProps) {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [trail, setTrail] = useState<{x: number, y: number, id: number}[]>([]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const trailIdRef = useRef(0);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setTrail([]);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (isPaused || isGameOver) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Check collisions
      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setIsGameOver(true);
        return prevSnake;
      }

      const tail = prevSnake[prevSnake.length - 1];
      setTrail(prev => [{ ...tail, id: trailIdRef.current++ }, ...prev].slice(0, 8));

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPaused, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
        case ' ': setIsPaused(p => !p); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  const gameLoop = useCallback((timestamp: number) => {
    if (timestamp - lastUpdateRef.current > INITIAL_SPEED) {
      moveSnake();
      lastUpdateRef.current = timestamp;
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [moveSnake]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameLoop]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-6">
      {/* HUD / Instrument Panel */}
      <div className="flex items-end justify-between w-full max-w-md mb-6 px-2">
        <div className="flex flex-col gap-1">
          <span className="micro-label">System Status</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500 animate-pulse' : 'bg-neon-lime shadow-[0_0_8px_rgba(57,255,20,0.8)]'}`} />
            <span className="font-mono text-xs font-bold tracking-widest">
              {isPaused ? 'STANDBY' : 'ACTIVE_LINK'}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <span className="micro-label">Neural Score</span>
          <div className="text-4xl font-mono font-black tracking-tighter leading-none" style={{ color: accentColor, textShadow: `0 0 15px ${accentColor}66` }}>
            {score.toString().padStart(4, '0')}
          </div>
        </div>
      </div>

      {/* Game Stage */}
      <div 
        className="relative aspect-square w-full max-w-md hardware-panel overflow-hidden transition-all duration-700"
        style={{ 
          borderColor: `${accentColor}33`, 
          boxShadow: `0 0 40px ${accentColor}08, inset 0 0 20px rgba(0,0,0,0.5)` 
        }}
      >
        {/* Technical Grid (Recipe 1) */}
        <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 opacity-[0.03]">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-white" />
          ))}
        </div>
        
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 opacity-20" style={{ borderColor: accentColor }} />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 opacity-20" style={{ borderColor: accentColor }} />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 opacity-20" style={{ borderColor: accentColor }} />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 opacity-20" style={{ borderColor: accentColor }} />

        {/* Trail segments */}
        {trail.map((segment, i) => (
          <motion.div
            key={`trail-${segment.id}`}
            initial={{ opacity: 0.4, scale: 0.8 }}
            animate={{ opacity: 0, scale: 0.2 }}
            transition={{ duration: 0.5 }}
            className="absolute w-[5%] h-[5%] rounded-full"
            style={{ 
              left: `${(segment.x / GRID_SIZE) * 100}%`,
              top: `${(segment.y / GRID_SIZE) * 100}%`,
              backgroundColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}`,
              zIndex: 1
            }}
          />
        ))}

        {/* Snake segments */}
        {snake.map((segment, i) => (
          <motion.div
            key={`${i}-${segment.x}-${segment.y}`}
            initial={false}
            animate={{ 
              left: `${(segment.x / GRID_SIZE) * 100}%`,
              top: `${(segment.y / GRID_SIZE) * 100}%`,
            }}
            className="absolute w-[5%] h-[5%] rounded-sm"
            style={{ 
              backgroundColor: accentColor,
              boxShadow: i === 0 ? `0 0 25px ${accentColor}` : `0 0 8px ${accentColor}33`,
              zIndex: i === 0 ? 10 : 5,
              opacity: 1 - (i / snake.length) * 0.4
            }}
          />
        ))}

        {/* Food / Target */}
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute w-[5%] h-[5%] flex items-center justify-center"
          style={{ 
            left: `${(food.x / GRID_SIZE) * 100}%`,
            top: `${(food.y / GRID_SIZE) * 100}%`,
          }}
        >
          <div className="w-2 h-2 bg-white rotate-45 shadow-[0_0_12px_#fff]" />
        </motion.div>

        {/* Overlays */}
        <AnimatePresence>
          {(isGameOver || isPaused) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-dark-bg/90 backdrop-blur-md"
            >
              {isGameOver ? (
                <div className="text-center p-8 border border-white/10 rounded-3xl bg-white/5">
                  <h2 className="text-5xl font-black mb-1 tracking-tighter italic text-glow-magenta uppercase">Link Severed</h2>
                  <p className="micro-label mb-8 opacity-60">Neural Feedback: {score} units</p>
                  <button 
                    onClick={resetGame}
                    className="group relative px-10 py-4 overflow-hidden rounded-full font-black text-xs tracking-[0.3em] uppercase transition-all"
                  >
                    <div className="absolute inset-0 bg-white transition-transform group-hover:scale-105" />
                    <span className="relative text-black">Re-Initialize</span>
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="text-6xl font-black mb-8 tracking-tighter italic text-white/20 uppercase">Suspended</h2>
                  <button 
                    onClick={() => setIsPaused(false)}
                    className="px-12 py-4 rounded-full font-bold text-xs tracking-[0.3em] uppercase transition-all hover:scale-105 active:scale-95 border-2 border-white/20 hover:border-white text-white"
                  >
                    Resume Link
                  </button>
                  <p className="mt-6 micro-label opacity-30">Press Space to Toggle</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="mt-8 flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <span className="micro-label">Navigation</span>
          <div className="flex gap-1">
            <div className="w-6 h-6 border border-white/10 rounded flex items-center justify-center text-[8px] font-mono opacity-40">↑</div>
            <div className="w-6 h-6 border border-white/10 rounded flex items-center justify-center text-[8px] font-mono opacity-40">↓</div>
            <div className="w-6 h-6 border border-white/10 rounded flex items-center justify-center text-[8px] font-mono opacity-40">←</div>
            <div className="w-6 h-6 border border-white/10 rounded flex items-center justify-center text-[8px] font-mono opacity-40">→</div>
          </div>
        </div>
        <div className="w-[1px] h-8 bg-white/10" />
        <div className="flex flex-col items-center gap-2">
          <span className="micro-label">Interrupt</span>
          <div className="px-3 py-1 border border-white/10 rounded text-[8px] font-mono opacity-40 uppercase tracking-widest">Space</div>
        </div>
      </div>
    </div>
  );
}
