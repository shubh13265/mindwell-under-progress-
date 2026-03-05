import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProgressiveMuscleRelaxationProps {
  onComplete?: (duration: number) => void;
}

const relaxationSteps = [
  {
    id: 1,
    name: "Feet and Toes",
    instruction: "Curl your toes tightly and tense your feet",
    relaxInstruction: "Release and feel the tension melt away from your feet",
    tenseDuration: 5,
    relaxDuration: 10,
    bodyPart: "feet"
  },
  {
    id: 2,
    name: "Calves",
    instruction: "Point your toes up and tense your calf muscles",
    relaxInstruction: "Let your calves become completely loose and heavy",
    tenseDuration: 5,
    relaxDuration: 10,
    bodyPart: "calves"
  },
  {
    id: 3,
    name: "Thighs",
    instruction: "Squeeze your thigh muscles as tight as you can",
    relaxInstruction: "Allow your thighs to sink down and relax completely",
    tenseDuration: 5,
    relaxDuration: 10,
    bodyPart: "thighs"
  },
  {
    id: 4,
    name: "Glutes",
    instruction: "Clench your buttock muscles firmly",
    relaxInstruction: "Release all tension from your glutes and hips",
    tenseDuration: 5,
    relaxDuration: 10,
    bodyPart: "glutes"
  },
  {
    id: 5,
    name: "Abdomen",
    instruction: "Tense your stomach muscles, pull them in tight",
    relaxInstruction: "Let your belly expand naturally as you breathe",
    tenseDuration: 5,
    relaxDuration: 10,
    bodyPart: "abdomen"
  },
  {
    id: 6,
    name: "Hands and Arms",
    instruction: "Make tight fists and tense your entire arms",
    relaxInstruction: "Open your hands and let your arms fall loose",
    tenseDuration: 5,
    relaxDuration: 10,
    bodyPart: "arms"
  },
  {
    id: 7,
    name: "Shoulders",
    instruction: "Raise your shoulders up to your ears",
    relaxInstruction: "Drop your shoulders and feel them melt down",
    tenseDuration: 5,
    relaxDuration: 10,
    bodyPart: "shoulders"
  },
  {
    id: 8,
    name: "Face",
    instruction: "Scrunch up your entire face - eyes, mouth, forehead",
    relaxInstruction: "Release all facial tension and let your face go soft",
    tenseDuration: 5,
    relaxDuration: 10,
    bodyPart: "face"
  }
];

export default function ProgressiveMuscleRelaxation({ onComplete }: ProgressiveMuscleRelaxationProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<'tense' | 'relax'>('tense');
  const [timeLeft, setTimeLeft] = useState(5);
  const [totalTime, setTotalTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && currentStep < relaxationSteps.length) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (phase === 'tense') {
              setPhase('relax');
              return relaxationSteps[currentStep].relaxDuration;
            } else {
              // Move to next step
              if (currentStep < relaxationSteps.length - 1) {
                setCurrentStep(prev => prev + 1);
                setPhase('tense');
                return relaxationSteps[currentStep + 1].tenseDuration;
              } else {
                // Exercise complete
                setIsActive(false);
                if (onComplete) {
                  onComplete(Math.floor(totalTime / 60));
                }
                return 0;
              }
            }
          }
          return prev - 1;
        });
        
        setTotalTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, currentStep, phase, totalTime, onComplete]);

  const startExercise = () => {
    setIsActive(true);
    setCurrentStep(0);
    setPhase('tense');
    setTimeLeft(relaxationSteps[0].tenseDuration);
    setTotalTime(0);
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const nextStep = () => {
    if (currentStep < relaxationSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setPhase('tense');
      setTimeLeft(relaxationSteps[currentStep + 1].tenseDuration);
    }
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentStep(0);
    setPhase('tense');
    setTimeLeft(relaxationSteps[0].tenseDuration);
    setTotalTime(0);
  };

  const getProgress = () => {
    const totalSteps = relaxationSteps.length * 2; // Each step has tense + relax phases
    const completedSteps = currentStep * 2 + (phase === 'relax' ? 1 : 0);
    return (completedSteps / totalSteps) * 100;
  };

  const getCurrentInstruction = () => {
    if (currentStep >= relaxationSteps.length) return "Exercise Complete!";
    
    const step = relaxationSteps[currentStep];
    return phase === 'tense' ? step.instruction : step.relaxInstruction;
  };

  const getBodyPartColor = (bodyPart: string) => {
    const colors = {
      feet: "from-blue-400 to-blue-600",
      calves: "from-green-400 to-green-600",
      thighs: "from-yellow-400 to-yellow-600",
      glutes: "from-orange-400 to-orange-600",
      abdomen: "from-red-400 to-red-600",
      arms: "from-purple-400 to-purple-600",
      shoulders: "from-pink-400 to-pink-600",
      face: "from-indigo-400 to-indigo-600"
    };
    return colors[bodyPart as keyof typeof colors] || "from-gray-400 to-gray-600";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentStep >= relaxationSteps.length && !isActive) {
    return (
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto flex items-center justify-center">
              <Dumbbell className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
              Relaxation Complete!
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              You've successfully completed the progressive muscle relaxation exercise.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total time: {formatTime(totalTime)}
            </p>
            <Button
              onClick={resetExercise}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="w-5 h-5 text-amber-600" />
            <span>Progressive Muscle Relaxation</span>
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
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
            <span>Progress</span>
            <span>{Math.round(getProgress())}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Current Step Display */}
        <div className="text-center space-y-6">
          {currentStep < relaxationSteps.length && (
            <>
              {/* Body Part Visualization */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <motion.div
                  animate={{
                    scale: isActive && phase === 'tense' ? [1, 1.1, 1] : 1,
                    opacity: isActive ? [0.8, 1, 0.8] : 0.9
                  }}
                  transition={{
                    duration: 2,
                    repeat: isActive && phase === 'tense' ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className={`w-24 h-24 bg-gradient-to-br ${getBodyPartColor(relaxationSteps[currentStep].bodyPart)} rounded-full mx-auto flex items-center justify-center shadow-lg`}
                >
                  <Dumbbell className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                  {relaxationSteps[currentStep].name}
                </h3>
              </motion.div>

              {/* Phase Indicator */}
              <div className="space-y-2">
                <div className="flex justify-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    phase === 'tense' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    Tense ({relaxationSteps[currentStep].tenseDuration}s)
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    phase === 'relax' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    Relax ({relaxationSteps[currentStep].relaxDuration}s)
                  </div>
                </div>
              </div>

              {/* Timer Display */}
              <motion.div
                animate={{
                  scale: isActive ? [1, 1.05, 1] : 1
                }}
                transition={{
                  duration: 1,
                  repeat: isActive ? Infinity : 0,
                  ease: "easeInOut"
                }}
                className="text-6xl font-bold text-slate-800 dark:text-white"
              >
                {timeLeft}
              </motion.div>

              {/* Instruction */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentStep}-${phase}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <p className={`text-lg font-medium ${
                    phase === 'tense' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {phase === 'tense' ? 'TENSE' : 'RELAX'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                    {getCurrentInstruction()}
                  </p>
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!isActive ? (
            <Button
              onClick={startExercise}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Exercise
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
            onClick={nextStep}
            disabled={currentStep >= relaxationSteps.length - 1}
            variant="outline"
            className="px-8 py-3"
          >
            <SkipForward className="w-5 h-5 mr-2" />
            Skip Step
          </Button>
          
          <Button
            onClick={resetExercise}
            variant="outline"
            className="px-8 py-3"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        </div>

        {/* Step Overview */}
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <h4 className="font-medium text-slate-800 dark:text-white mb-3">
            Exercise Steps ({currentStep + 1}/{relaxationSteps.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
            {relaxationSteps.map((step, index) => (
              <div
                key={step.id}
                className={`p-2 rounded text-xs ${
                  index === currentStep
                    ? 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-800 dark:text-amber-200'
                    : index < currentStep
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                }`}
              >
                {step.name}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
            Total session time: ~{Math.floor((relaxationSteps.length * 15) / 60)} minutes
          </p>
        </div>
      </CardContent>
    </Card>
  );
}