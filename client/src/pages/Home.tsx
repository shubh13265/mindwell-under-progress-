import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Brain, Calendar, Activity, MessageCircle, Smile, TrendingUp, LogOut, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentMoods } = useQuery({
    queryKey: ["/api/moods"],
    select: (data) => data?.slice(0, 3) || []
  });

  const { data: recentActivities } = useQuery({
    queryKey: ["/api/activities"],
    select: (data) => data?.slice(0, 3) || []
  });

  const quickActions = [
    {
      title: "Track Mood",
      description: "Record how you're feeling",
      icon: Smile,
      link: "/dashboard",
      gradient: "from-blue-600 to-purple-600"
    },
    {
      title: "Start Exercise",
      description: "Begin a wellness activity",
      icon: Activity,
      link: "/exercises",
      gradient: "from-green-600 to-blue-600"
    },
    {
      title: "Chat with AI",
      description: "Talk to your companion",
      icon: MessageCircle,
      link: "/ai-chat",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      title: "View Progress",
      description: "See your wellness journey",
      icon: TrendingUp,
      link: "/dashboard",
      gradient: "from-amber-600 to-orange-600"
    }
  ];

  const moodEmojis = ['😢', '😐', '🙂', '😊', '😄'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md z-50 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <Brain className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-white">MindWell</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
              <Link href="/exercises" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Exercises</Link>
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
          {/* Welcome Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Welcome back, {user?.firstName || 'Friend'}! 👋
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              How are you feeling today? Let's continue your wellness journey together.
            </p>
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

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={action.link}>
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-full flex items-center justify-center mx-auto mb-4`}>
                          <action.icon className="text-white w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{action.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{action.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Moods */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smile className="w-5 h-5 text-blue-600" />
                    <span>Recent Moods</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentMoods && recentMoods.length > 0 ? (
                    <div className="space-y-3">
                      {recentMoods.map((mood: any) => (
                        <div key={mood.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{moodEmojis[mood.moodValue - 1]}</span>
                            <div>
                              <p className="font-medium text-slate-800 dark:text-white">
                                {new Date(mood.createdAt).toLocaleDateString()}
                              </p>
                              {mood.note && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">{mood.note}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-slate-500">
                            {new Date(mood.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Smile className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">No mood entries yet</p>
                      <Link href="/dashboard">
                        <Button className="mt-4" size="sm">Track Your Mood</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activities */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span>Recent Activities</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivities && recentActivities.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivities.map((activity: any) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                              <Activity className="text-white w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 dark:text-white">{activity.name}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {activity.duration ? `${activity.duration} minutes` : activity.type}
                              </p>
                            </div>
                          </div>
                          {activity.completed && (
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">No activities yet</p>
                      <Link href="/exercises">
                        <Button className="mt-4" size="sm">Start an Exercise</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
