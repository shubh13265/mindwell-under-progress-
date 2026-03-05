import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Timer, Play, Pause, RotateCcw, Volume2, VolumeX, Waves } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MeditationTimerProps {
  onComplete?: (duration: number) => void;
}

const ambientSounds = {
  none: { name: "Silent", frequency: 0 },
  rain: { name: "Rain", frequency: 200 },
  ocean: { name: "Ocean Waves", frequency: 150 },
  forest: { name: "Forest", frequency: 300 },
  bells: { name: "Tibetan Bells", frequency: 440 }
};

export default function MeditationTimer({ onComplete }: MeditationTimerProps) {
  const [duration, setDuration] = useState([5]); // in minutes
  const [timeLeft, setTimeLeft] = useState(300); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSound, setSelectedSound] = useState<keyof typeof ambientSounds>("rain");
  const [volume, setVolume] = useState([0.3]);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  // Initialize audio context and create ambient sounds
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new AudioContext();
      createNoiseBuffer();
    }
    return () => {
      stopAmbientSound();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update time left when duration changes
  useEffect(() => {
    if (!isActive && !isPaused) {
      setTimeLeft(duration[0] * 60);
    }
  }, [duration, isActive, isPaused]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setIsPaused(false);
            stopAmbientSound();
            playCompletionBells();
            if (onComplete) {
              onComplete(duration[0]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, duration, onComplete]);

  // Create noise buffer for ambient sounds
  const createNoiseBuffer = () => {
    if (!audioContextRef.current) return;
    
    const bufferSize = audioContextRef.current.sampleRate * 2;
    const buffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    noiseBufferRef.current = buffer;
  };

  // Play ambient sound
  const playAmbientSound = () => {
    if (!audioContextRef.current || isMuted || selectedSound === 'none') return;
    
    stopAmbientSound();
    
    const sound = ambientSounds[selectedSound];
    
    if (selectedSound === 'rain' || selectedSound === 'ocean' || selectedSound === 'forest') {
      // Create filtered noise for nature sounds
      if (noiseBufferRef.current) {
        const source = audioContextRef.current.createBufferSource();
        const filter = audioContextRef.current.createBiquadFilter();
        const gain = audioContextRef.current.createGain();
        
        source.buffer = noiseBufferRef.current;
        source.loop = true;
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(sound.frequency, audioContextRef.current.currentTime);
        
        gain.gain.setValueAtTime(volume[0], audioContextRef.current.currentTime);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(audioContextRef.current.destination);
        
        source.start();
        gainNodeRef.current = gain;
        
        // Store reference for cleanup
        (source as any)._mindwellSource = true;
      }
    } else if (selectedSound === 'bells') {
      // Create periodic bell sounds
      const playBell = () => {
        if (!audioContextRef.current || !isActive) return;
        
        const oscillator = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        
        oscillator.connect(gain);
        gain.connect(audioContextRef.current.destination);
        
        oscillator.frequency.setValueAtTime(sound.frequency, audioContextRef.current.currentTime);
        oscillator.type = 'sine';
        
        gain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        gain.gain.linearRampToValueAtTime(volume[0] * 0.3, audioContextRef.current.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 3);
        
        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + 3);
        
        setTimeout(playBell, 8000 + Math.random() * 4000); // Random interval between bells
      };
      
      playBell();
    }
  };

  // Stop ambient sound
  const stopAmbientSound = () => {
    if (audioContextRef.current) {
      // Stop all sources
      const sources = (audioContextRef.current as any)._sources || [];
      sources.forEach((source: AudioNode) => {
        if ((source as any).stop) {
          (source as any).stop();
        }
      });
    }
    
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    
    if (gainNodeRef.current) {
      gainNodeRef.current = null;
    }
  };

  // Play completion bells
  const playCompletionBells = () => {
    if (!audioContextRef.current || isMuted) return;
    
    const frequencies = [523, 659, 784]; // C, E, G major chord
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContextRef.current!.createOscillator();
        const gain = audioContextRef.current!.createGain();
        
        oscillator.connect(gain);
        gain.connect(audioContextRef.current!.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContextRef.current!.currentTime);
        oscillator.type = 'sine';
        
        gain.gain.setValueAtTime(0, audioContextRef.current!.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, audioContextRef.current!.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current!.currentTime + 2);
        
        oscillator.start();
        oscillator.stop(audioContextRef.current!.currentTime + 2);
      }, index * 200);
    });
  };

  const startMeditation = () => {
    setIsActive(true);
    setIsPaused(false);
    playAmbientSound();
  };

  const pauseMeditation = () => {
    setIsPaused(true);
    stopAmbientSound();
  };

  const resumeMeditation = () => {
    setIsPaused(false);
    playAmbientSound();
  };

  const resetMeditation = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(duration[0] * 60);
    stopAmbientSound();
  };

  // Update ambient sound volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume[0], audioContextRef.current?.currentTime || 0);
    }
  }, [volume, isMuted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = duration[0] * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  return (
    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Timer className="w-5 h-5 text-green-600" />
            <span>Meditation Timer</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-600 dark:text-slate-300"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Duration Settings */}
        {!isActive && !isPaused && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Duration: {duration[0]} minutes
              </label>
              <Slider
                value={duration}
                onValueChange={setDuration}
                max={60}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Ambient Sound Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Ambient Sound
              </label>
              <Select value={selectedSound} onValueChange={(value) => setSelectedSound(value as keyof typeof ambientSounds)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ambientSounds).map(([key, sound]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <Waves className="w-4 h-4" />
                        <span>{sound.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Volume Control */}
            {selectedSound !== 'none' && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Volume: {Math.round(volume[0] * 100)}%
                </label>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Timer Display */}
        <div className="flex flex-col items-center space-y-6">
          {/* Circular Progress */}
          <div className="relative">
            <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-slate-200 dark:text-slate-700"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                className="text-green-600"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: isActive ? getProgress() / 100 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{
                  strokeDasharray: "283",
                  strokeDashoffset: `${283 - (283 * getProgress()) / 100}`
                }}
              />
            </svg>
            
            {/* Time Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  animate={{
                    scale: isActive && !isPaused ? [1, 1.05, 1] : 1
                  }}
                  transition={{
                    duration: 2,
                    repeat: isActive && !isPaused ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className="text-4xl font-bold text-slate-800 dark:text-white"
                >
                  {formatTime(timeLeft)}
                </motion.div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {isActive ? (isPaused ? 'Paused' : 'Meditating') : 'Ready to begin'}
                </p>
              </div>
            </div>
          </div>

          {/* Breathing Guide */}
          {isActive && !isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto flex items-center justify-center"
              >
                <Waves className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Focus on your breath and let your mind settle
              </p>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!isActive ? (
            <Button
              onClick={startMeditation}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Meditation
            </Button>
          ) : isPaused ? (
            <Button
              onClick={resumeMeditation}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              Resume
            </Button>
          ) : (
            <Button
              onClick={pauseMeditation}
              variant="outline"
              className="px-8 py-3"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
          )}
          
          <Button
            onClick={resetMeditation}
            variant="outline"
            className="px-8 py-3"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        </div>

        {/* Session Info */}
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Find a comfortable position, close your eyes, and focus on your breathing.
            Let thoughts come and go without judgment.
          </p>
          {selectedSound !== 'none' && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              🎵 {ambientSounds[selectedSound].name} will play during your session
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}