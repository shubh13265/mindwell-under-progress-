import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Brain, ArrowLeft, LogOut, Settings, Wind, Gamepad2, BookOpen, Dumbbell, Timer, Play, Pause, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BreathingExercise from "@/components/BreathingExercise";
import MeditationTimer from "@/components/MeditationTimer";
import ProgressiveMuscleRelaxation from "@/components/ProgressiveMuscleRelaxation";

export default function Exercises() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState(0);
  
  const [meditationTimer, setMeditationTimer] = useState(300); // 5 minutes default
  const [meditationActive, setMeditationActive] = useState(false);
  const [meditationTimeLeft, setMeditationTimeLeft] = useState(300);

  const [journalEntry, setJournalEntry] = useState("");
  const [journalTitle, setJournalTitle] = useState("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: journalPrompt } = useQuery({
    queryKey: ["/api/journal/prompt"],
    retry: false,
  });

  const createExerciseSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/exercises", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({
        title: "Session Completed",
        description: "Great job! Your exercise session has been recorded.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to record exercise session.",
        variant: "destructive",
      });
    },
  });

  const createJournalEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/journal", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({
        title: "Entry Saved",
        description: "Your journal entry has been saved.",
      });
      setJournalEntry("");
      setJournalTitle("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save journal entry.",
        variant: "destructive",
      });
    },
  });

  // Breathing exercise logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathingTimer(prev => {
          const newTime = prev + 1;
          const cycle = newTime % 12; // 4 seconds each phase
          
          if (cycle < 4) {
            setBreathingPhase('inhale');
          } else if (cycle < 8) {
            setBreathingPhase('hold');
          } else {
            setBreathingPhase('exhale');
          }
          
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingActive]);

  // Meditation timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (meditationActive && meditationTimeLeft > 0) {
      interval = setInterval(() => {
        setMeditationTimeLeft(prev => {
          if (prev <= 1) {
            setMeditationActive(false);
            createExerciseSessionMutation.mutate({
              exerciseType: "meditation",
              duration: meditationTimer,
              completed: true,
              data: { timerDuration: meditationTimer }
            });
            toast({
              title: "Meditation Complete",
              description: "Well done! You've completed your meditation session.",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [meditationActive, meditationTimeLeft, meditationTimer]);

  const startBreathing = () => {
    setBreathingActive(true);
    setBreathingTimer(0);
  };

  const stopBreathing = () => {
    setBreathingActive(false);
    if (breathingTimer > 0) {
      createExerciseSessionMutation.mutate({
        exerciseType: "breathing",
        duration: Math.floor(breathingTimer / 60),
        completed: true,
        data: { totalSeconds: breathingTimer }
      });
    }
  };

  const startMeditation = () => {
    setMeditationActive(true);
    setMeditationTimeLeft(meditationTimer);
  };

  const stopMeditation = () => {
    setMeditationActive(false);
    if (meditationTimer - meditationTimeLeft > 60) {
      createExerciseSessionMutation.mutate({
        exerciseType: "meditation",
        duration: Math.floor((meditationTimer - meditationTimeLeft) / 60),
        completed: false,
        data: { timerDuration: meditationTimer, timeCompleted: meditationTimer - meditationTimeLeft }
      });
    }
  };

  const resetMeditation = () => {
    setMeditationActive(false);
    setMeditationTimeLeft(meditationTimer);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const saveJournalEntry = () => {
    if (!journalEntry.trim()) {
      toast({
        title: "Empty Entry",
        description: "Please write something before saving.",
        variant: "destructive",
      });
      return;
    }

    createJournalEntryMutation.mutate({
      title: journalTitle || "Journal Entry",
      content: journalEntry,
      prompt: journalPrompt?.prompt
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="text-white w-8 h-8" />
          </div>
          <p className="text-slate-600 dark:text-slate-300">Loading exercises...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const exercises = [
    {
      id: "breathing",
      title: "Guided Breathing Exercise",
      description: "Interactive breathing patterns with visual guidance and audio cues",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      icon: Wind,
      gradient: "from-blue-600 to-purple-600",
      component: (
        <BreathingExercise 
          onComplete={(duration) => {
            createExerciseSessionMutation.mutate({
              exerciseType: "breathing",
              duration: duration,
              completed: true,
              data: { totalMinutes: duration }
            });
          }}
        />
      )
    },
    {
      id: "meditation",
      title: "Meditation Timer",
      description: "Customizable timer with ambient sounds and progress tracking",
      image: "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      icon: Timer,
      gradient: "from-green-600 to-blue-600",
      component: (
        <MeditationTimer
          onComplete={(duration) => {
            createExerciseSessionMutation.mutate({
              exerciseType: "meditation",
              duration: duration,
              completed: true,
              data: { timerDuration: duration }
            });
          }}
        />
      )
    },
    {
      id: "relaxation",
      title: "Progressive Muscle Relaxation",
      description: "Step-by-step guided muscle relaxation with visual cues",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      icon: Dumbbell,
      gradient: "from-amber-600 to-orange-600",
      component: (
        <ProgressiveMuscleRelaxation
          onComplete={(duration) => {
            createExerciseSessionMutation.mutate({
              exerciseType: "relaxation",
              duration: duration,
              completed: true,
              data: { type: "progressive_muscle_relaxation" }
            });
          }}
        />
      )
    },
    {
      id: "journal",
      title: "Thought Journal",
      description: "Record and reflect on your thoughts with guided prompts",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      icon: BookOpen,
      gradient: "from-purple-600 to-pink-600",
      component: (
        <div className="space-y-6">
          {journalPrompt?.prompt && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Today's Prompt:</h4>
              <p className="text-slate-600 dark:text-slate-300">{journalPrompt.prompt}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title (optional)
            </label>
            <Input
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              placeholder="Give your entry a title..."
              className="mb-4"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Your thoughts
            </label>
            <Textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Write about your thoughts, feelings, or experiences..."
              className="min-h-[200px]"
            />
          </div>
          
          <Button 
            onClick={saveJournalEntry}
            disabled={createJournalEntryMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {createJournalEntryMutation.isPending ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      )
    },
    {
      id: "relaxation",
      title: "Progressive Muscle Relaxation",
      description: "Progressive exercises to release physical tension",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      icon: Dumbbell,
      gradient: "from-amber-600 to-orange-600",
      component: (
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full mx-auto mb-8 flex items-center justify-center">
            <Dumbbell className="text-white w-12 h-12" />
          </div>
          
          <div className="space-y-4 text-left">
            <p className="text-slate-600 dark:text-slate-300">
              Follow these steps to progressively relax your muscles:
            </p>
            
            <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>1. Start with your toes - tense for 5 seconds, then relax</li>
              <li>2. Move to your calves - tense and relax</li>
              <li>3. Continue with your thighs</li>
              <li>4. Tense your abdomen, then relax</li>
              <li>5. Make fists with your hands, then relax</li>
              <li>6. Tense your shoulders, then let them drop</li>
              <li>7. Scrunch your face, then relax completely</li>
            </ol>
          </div>
          
          <Button 
            onClick={() => {
              createExerciseSessionMutation.mutate({
                exerciseType: "relaxation",
                duration: 10,
                completed: true,
                data: { type: "progressive_muscle_relaxation" }
              });
            }}
            className="mt-6 bg-gradient-to-r from-amber-600 to-orange-600"
          >
            Complete Session
          </Button>
        </div>
      )
    },
    {
      id: "cognitive",
      title: "Cognitive Games",
      description: "Brain training exercises to improve cognitive function",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      icon: Gamepad2,
      gradient: "from-indigo-600 to-purple-600",
      component: (
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mx-auto mb-8 flex items-center justify-center">
            <Gamepad2 className="text-white w-12 h-12" />
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white">Memory Challenge</h4>
            <p className="text-slate-600 dark:text-slate-300">
              Try to remember this sequence: Blue, Red, Green, Yellow, Purple
            </p>
            
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              {['Blue', 'Red', 'Green', 'Yellow', 'Purple', 'Orange'].map((color) => (
                <Button
                  key={color}
                  variant="outline"
                  size="sm"
                  className={`h-12 ${color.toLowerCase() === 'blue' ? 'bg-blue-100 dark:bg-blue-900' : 
                    color.toLowerCase() === 'red' ? 'bg-red-100 dark:bg-red-900' :
                    color.toLowerCase() === 'green' ? 'bg-green-100 dark:bg-green-900' :
                    color.toLowerCase() === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    color.toLowerCase() === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                    'bg-orange-100 dark:bg-orange-900'}`}
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={() => {
              createExerciseSessionMutation.mutate({
                exerciseType: "cognitive",
                duration: 5,
                completed: true,
                data: { type: "memory_challenge" }
              });
            }}
            className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            Complete Game
          </Button>
        </div>
      )
    },
    {
      id: "mindfulness",
      title: "Mindfulness Game",
      description: "Interactive games to improve focus and present-moment awareness",
      image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      icon: Gamepad2,
      gradient: "from-teal-600 to-blue-600",
      component: (
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full mx-auto mb-8 flex items-center justify-center">
            <Gamepad2 className="text-white w-12 h-12" />
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white">5-4-3-2-1 Grounding</h4>
            <div className="text-left space-y-2 text-slate-600 dark:text-slate-300">
              <p>Name:</p>
              <ul className="space-y-1 ml-4">
                <li>• 5 things you can see</li>
                <li>• 4 things you can touch</li>
                <li>• 3 things you can hear</li>
                <li>• 2 things you can smell</li>
                <li>• 1 thing you can taste</li>
              </ul>
            </div>
          </div>
          
          <Button 
            onClick={() => {
              createExerciseSessionMutation.mutate({
                exerciseType: "mindfulness",
                duration: 5,
                completed: true,
                data: { type: "5_4_3_2_1_grounding" }
              });
            }}
            className="mt-6 bg-gradient-to-r from-teal-600 to-blue-600"
          >
            Complete Exercise
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md z-50 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                  <Brain className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-slate-800 dark:text-white">Exercises</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
              <Link href="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
              <Link href="/ai-chat" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">AI Assistant</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">Wellness Exercises & Games</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">Interactive activities designed to boost your mental wellbeing</p>
          </motion.div>

          {/* Exercises Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <img 
                      src={exercise.image} 
                      alt={exercise.title}
                      className="w-full h-32 object-cover rounded-xl mb-6" 
                    />
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">{exercise.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{exercise.description}</p>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className={`w-full bg-gradient-to-r ${exercise.gradient} hover:shadow-lg transition-all duration-300 text-white`}
                        >
                          <exercise.icon className="w-4 h-4 mr-2" />
                          Start {exercise.title}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <exercise.icon className="w-5 h-5" />
                            <span>{exercise.title}</span>
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          {exercise.component}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
