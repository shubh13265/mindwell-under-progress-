import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BreathingExerciseProps {
  onComplete?: (duration: number) => void;
}

const breathingPatterns = {
  "4-4-4": { name: "Box Breathing", inhale: 4, hold: 4, exhale: 4, rest: 0 },
  "4-7-8": { name: "Relaxing Breath", inhale: 4, hold: 7, exhale: 8, rest: 0 },
  "6-2-6": { name: "Calming Breath", inhale: 6, hold: 2, exhale: 6, rest: 0 },
  "4-4-4-4": { name: "Square Breathing", inhale: 4, hold: 4, exhale: 4, rest: 4 }
};

export default function BreathingExercise({ onComplete }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [totalTime, setTotalTime] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState<keyof typeof breathingPatterns>("4-4-4");
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const pattern = breathingPatterns[selectedPattern];

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new AudioContext();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play tone for phase transitions
  const playTone = (frequency: number, duration: number = 200) => {
    if (isMuted || !audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + duration / 1000);
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  };

  // Breathing cycle logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Move to next phase
            setCurrentPhase(currentPhase => {
              let nextPhase: typeof currentPhase;
              let nextDuration: number;
              
              switch (currentPhase) {
                case 'inhale':
                  nextPhase = 'hold';
                  nextDuration = pattern.hold;
                  playTone(440); // A note for hold
                  break;
                case 'hold':
                  nextPhase = 'exhale';
                  nextDuration = pattern.exhale;
                  playTone(330); // E note for exhale
                  break;
                case 'exhale':
                  if (pattern.rest > 0) {
                    nextPhase = 'rest';
                    nextDuration = pattern.rest;
                    playTone(220); // A note (lower) for rest
                  } else {
                    nextPhase = 'inhale';
                    nextDuration = pattern.inhale;
                    playTone(523); // C note for inhale
                  }
                  break;
                case 'rest':
                  nextPhase = 'inhale';
                  nextDuration = pattern.inhale;
                  playTone(523); // C note for inhale
                  break;
              }
              
              return nextPhase;
            });
            
            return currentPhase === 'inhale' ? pattern.inhale :
                   currentPhase === 'hold' ? pattern.hold :
                   currentPhase === 'exhale' ? pattern.exhale :
                   pattern.rest;
          }
          return prev - 1;
        });
        
        setTotalTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, currentPhase, pattern]);

  const startExercise = () => {
    setIsActive(true);
    setTotalTime(0);
    setCurrentPhase('inhale');
    setTimeLeft(pattern.inhale);
    playTone(523); // Start with inhale tone
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setTimeLeft(pattern.inhale);
    if (totalTime > 0 && onComplete) {
      onComplete(totalTime);
    }
    setTotalTime(0);
  };

  const getPhaseInstructions = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe In Slowly';
      case 'hold':
        return 'Hold Your Breath';
      case 'exhale':
        return 'Breathe Out Slowly';
      case 'rest':
        return 'Rest and Relax';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'from-blue-400 to-blue-600';
      case 'hold':
        return 'from-purple-400 to-purple-600';
      case 'exhale':
        return 'from-green-400 to-green-600';
      case 'rest':
        return 'from-amber-400 to-amber-600';
    }
  };

  const getCircleScale = () => {
    const progress = 1 - (timeLeft / getCurrentPhaseDuration());
    
    switch (currentPhase) {
      case 'inhale':
        return 1 + (progress * 0.5); // Grow from 1 to 1.5
      case 'hold':
        return 1.5; // Stay at 1.5
      case 'exhale':
        return 1.5 - (progress * 0.5); // Shrink from 1.5 to 1
      case 'rest':
        return 1; // Stay at 1
    }
  };

  const getCurrentPhaseDuration = () => {
    switch (currentPhase) {
      case 'inhale':
        return pattern.inhale;
      case 'hold':
        return pattern.hold;
      case 'exhale':
        return pattern.exhale;
      case 'rest':
        return pattern.rest;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wind className="w-5 h-5 text-blue-600" />
            <span>Guided Breathing Exercise</span>
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
        {/* Pattern Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Breathing Pattern
          </label>
          <Select value={selectedPattern} onValueChange={(value) => setSelectedPattern(value as keyof typeof breathingPatterns)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(breathingPatterns).map(([key, pattern]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex flex-col">
                    <span>{pattern.name}</span>
                    <span className="text-xs text-slate-500">
                      {key.split('-').map((n, i) => {
                        const labels = ['In', 'Hold', 'Out', 'Rest'];
                        return `${labels[i]}: ${n}s`;
                      }).join(' • ')}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Breathing Circle Visualization */}
        <div className="flex flex-col items-center space-y-8">
          {/* Main breathing circle */}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{
                scale: isActive ? getCircleScale() : 1,
                rotate: isActive ? 360 : 0
              }}
              transition={{
                scale: { duration: getCurrentPhaseDuration(), ease: "easeInOut" },
                rotate: { duration: getCurrentPhaseDuration() * 4, ease: "linear", repeat: Infinity }
              }}
              className={`w-48 h-48 rounded-full bg-gradient-to-br ${getPhaseColor()} flex items-center justify-center shadow-2xl`}
            >
              <motion.div
                animate={{
                  opacity: isActive ? [0.6, 1, 0.6] : 0.8
                }}
                transition={{
                  duration: 2,
                  repeat: isActive ? Infinity : 0,
                  ease: "easeInOut"
                }}
                className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <Wind className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
            
            {/* Breathing rings */}
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.3, 0, 0.3]
                  }}
                  transition={{
                    duration: getCurrentPhaseDuration(),
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                  className={`w-48 h-48 rounded-full border-2 border-gradient-to-br ${getPhaseColor().replace('bg-gradient-to-br', 'border')}`}
                />
              </div>
            )}
          </div>

          {/* Phase instruction and timer */}
          <div className="text-center space-y-2">
            <AnimatePresence mode="wait">
              <motion.h3
                key={currentPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-semibold text-slate-800 dark:text-white"
              >
                {getPhaseInstructions()}
              </motion.h3>
            </AnimatePresence>
            
            <div className="flex items-center justify-center space-x-4">
              <motion.div
                animate={{
                  scale: isActive ? [1, 1.1, 1] : 1
                }}
                transition={{
                  duration: 1,
                  repeat: isActive ? Infinity : 0
                }}
                className="text-4xl font-bold text-slate-600 dark:text-slate-300"
              >
                {timeLeft}
              </motion.div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Total time: {formatTime(totalTime)}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!isActive ? (
            <Button
              onClick={startExercise}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Breathing
            </Button>
          ) : (
            <Button
              onClick={pauseExercise}
              variant="outline"
              className="px-8 py-3"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
          )}
          
          <Button
            onClick={resetExercise}
            variant="outline"
            className="px-8 py-3"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        </div>

        {/* Pattern Guide */}
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <h4 className="font-medium text-slate-800 dark:text-white mb-3">
            {pattern.name} Pattern
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto"></div>
              <p className="text-sm font-medium">Inhale</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{pattern.inhale}s</p>
            </div>
            {pattern.hold > 0 && (
              <div className="space-y-1">
                <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto"></div>
                <p className="text-sm font-medium">Hold</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{pattern.hold}s</p>
              </div>
            )}
            <div className="space-y-1">
              <div className="w-8 h-8 bg-green-500 rounded-full mx-auto"></div>
              <p className="text-sm font-medium">Exhale</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{pattern.exhale}s</p>
            </div>
            {pattern.rest > 0 && (
              <div className="space-y-1">
                <div className="w-8 h-8 bg-amber-500 rounded-full mx-auto"></div>
                <p className="text-sm font-medium">Rest</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{pattern.rest}s</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}