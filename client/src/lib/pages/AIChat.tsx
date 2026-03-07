import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Brain, ArrowLeft, LogOut, Settings, Mic, Send, MicOff, User, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VoiceVisualizer from "@/components/VoiceVisualizer";

interface ChatMessage {
  id: number;
  message: string;
  isAI: boolean;
  createdAt: string;
}

export default function AIChat() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voicePreference, setVoicePreference] = useState<'male' | 'female'>('female');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  // Set voice preference from user data
  useEffect(() => {
    if (user?.preferredVoice) {
      setVoicePreference(user.preferredVoice as 'male' | 'female');
    }
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsRecording(false);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not understand speech. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, [toast]);

  const { data: chatHistory, refetch: refetchChat } = useQuery({
    queryKey: ["/api/chat/history"],
    retry: false,
  });

  const updateVoicePreferenceMutation = useMutation({
    mutationFn: async (voice: 'male' | 'female') => {
      await apiRequest("POST", "/api/user/voice-preference", { voice });
    },
    onSuccess: () => {
      toast({
        title: "Voice Updated",
        description: "Your voice preference has been saved.",
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
        description: "Failed to update voice preference.",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", "/api/chat", { message: messageText });
      return response.json();
    },
    onSuccess: (aiResponse) => {
      refetchChat();
      
      // Text-to-speech for AI response
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel(); // Cancel any ongoing speech
        
        const utterance = new SpeechSynthesisUtterance(aiResponse.message);
        utterance.rate = 0.9;
        utterance.pitch = voicePreference === 'female' ? 1.2 : 0.8;
        
        // Try to find a voice that matches preference
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voicePreference === 'female' 
            ? voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') || voice.name.toLowerCase().includes('samantha')
            : voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('man') || voice.name.toLowerCase().includes('daniel')
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        synthesisRef.current = utterance;
        speechSynthesis.speak(utterance);
      }
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
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const messageText = message.trim();
    setMessage("");
    sendMessageMutation.mutate(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVoiceRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setIsRecording(true);
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
    }
  };

  const handleVoiceChange = (voice: 'male' | 'female') => {
    setVoicePreference(voice);
    updateVoicePreferenceMutation.mutate(voice);
  };

  const quickResponses = [
    "I need motivation",
    "I'm feeling anxious",
    "Help me relax",
    "I want to meditate",
    "I'm feeling overwhelmed",
    "Tell me something positive"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="text-white w-8 h-8" />
          </div>
          <p className="text-slate-600 dark:text-slate-300">Loading AI assistant...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
                <span className="text-xl font-bold text-slate-800 dark:text-white">AI Assistant</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
              <Link href="/exercises" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Exercises</Link>
              <Link href="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">Your AI Wellness Companion</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">24/7 emotional support with personalized voice interaction</p>
          </motion.div>

          {/* Chat Interface */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <CardContent className="p-8">
              {/* Voice Settings */}
              <div className="flex justify-center mb-8">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-full p-2 flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleVoiceChange('female')}
                    className={voicePreference === 'female' 
                      ? "bg-gradient-to-r from-blue-600 to-green-600 text-white" 
                      : "text-slate-600 dark:text-slate-300 bg-transparent hover:bg-white dark:hover:bg-slate-600"
                    }
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Female Voice
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleVoiceChange('male')}
                    className={voicePreference === 'male' 
                      ? "bg-gradient-to-r from-blue-600 to-green-600 text-white" 
                      : "text-slate-600 dark:text-slate-300 bg-transparent hover:bg-white dark:hover:bg-slate-600"
                    }
                  >
                    <User className="w-4 h-4 mr-2" />
                    Male Voice
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 mb-6 h-96 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {chatHistory && chatHistory.length > 0 ? (
                      chatHistory.slice().reverse().map((msg: ChatMessage) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex items-start space-x-3 ${msg.isAI ? '' : 'justify-end'}`}
                        >
                          {msg.isAI && (
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                              <Brain className="text-white w-4 h-4" />
                            </div>
                          )}
                          <div className={`max-w-md rounded-2xl px-4 py-3 ${
                            msg.isAI 
                              ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm' 
                              : 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                          }`}>
                            <p className={msg.isAI ? 'text-slate-800 dark:text-white' : 'text-white'}>
                              {msg.message}
                            </p>
                            <span className={`text-xs ${
                              msg.isAI ? 'text-slate-500 dark:text-slate-400' : 'text-blue-100'
                            }`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {!msg.isAI && (
                            <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
                              <User className="text-slate-600 dark:text-slate-300 w-4 h-4" />
                            </div>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                          <Brain className="text-white w-8 h-8" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                          Hello! I'm your AI wellness companion. How are you feeling today?
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          You can type a message or use voice input to start our conversation.
                        </p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Voice Visualization */}
              <div className="flex justify-center mb-6">
                <VoiceVisualizer isActive={isListening || sendMessageMutation.isPending} />
              </div>

              {/* Chat Input */}
              <div className="flex space-x-4 mb-4">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message or click to speak..."
                  className="flex-1"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  disabled={sendMessageMutation.isPending}
                  className={`${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700'
                  } text-white`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              {/* Quick Responses */}
              <div className="flex flex-wrap gap-2">
                {quickResponses.map((response) => (
                  <Button
                    key={response}
                    variant="outline"
                    size="sm"
                    onClick={() => setMessage(response)}
                    disabled={sendMessageMutation.isPending}
                    className="text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {response}
                  </Button>
                ))}
              </div>

              {sendMessageMutation.isPending && (
                <div className="text-center mt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    AI is thinking...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
