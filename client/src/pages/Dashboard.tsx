import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Brain, Calendar, Activity, TrendingUp, Smile, LogOut, Settings, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import MoodTracker from "@/components/MoodTracker";
import ActivityTracker from "@/components/ActivityTracker";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: moods } = useQuery({
    queryKey: ["/api/moods"],
    retry: false,
  });

  const { data: activities } = useQuery({
    queryKey: ["/api/activities"],
    retry: false,
  });

  const { data: moodStats } = useQuery({
    queryKey: ["/api/moods/stats"],
    retry: false,
  });

  const { data: activityStats } = useQuery({
    queryKey: ["/api/activities/stats"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="text-white w-8 h-8" />
          </div>
          <p className="text-slate-600 dark:text-slate-300">Loading your dashboard...</p>
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
                <span className="text-xl font-bold text-slate-800 dark:text-white">Dashboard</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
              <Link href="/exercises" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Exercises</Link>
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
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">Your Wellness Dashboard</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">Track your progress and celebrate your achievements</p>
          </motion.div>

          {/* Stats Overview */}
          {stats && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid md:grid-cols-4 gap-6 mb-12"
            >
              <Card className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 border-blue-600/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="text-blue-600 w-8 h-8" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">This Week</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-800 dark:text-white">{stats.dailyActivities}</div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Daily activities completed</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-600/10 to-green-600/5 border-green-600/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Smile className="text-green-600 w-8 h-8" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Today</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-800 dark:text-white">{stats.moodScore}</div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Average mood score</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 border-purple-600/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Brain className="text-purple-600 w-8 h-8" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">This Month</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-800 dark:text-white">{stats.exercisesCompleted}</div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Exercises completed</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-600/10 to-amber-600/5 border-amber-600/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="text-amber-600 w-8 h-8" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Streak</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-800 dark:text-white">{stats.streak}</div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Days in a row</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Dashboard Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Mood Tracker */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <MoodTracker moods={moods || []} />
            </motion.div>

            {/* Activity Tracker */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <ActivityTracker activities={activities || []} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
