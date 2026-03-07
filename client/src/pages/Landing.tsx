import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Smile, Bot, Gamepad2, Heart, Calendar, Activity, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const [showDemo, setShowDemo] = useState(false);

  const features = [
    {
      icon: Smile,
      title: "Mood Tracking",
      description: "Monitor your emotional wellbeing with intuitive daily mood tracking and insights",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: Bot,
      title: "AI Voice Assistant",
      description: "Chat with your personalized AI companion available 24/7 for emotional support",
      gradient: "from-green-500 to-blue-500"
    },
    {
      icon: Gamepad2,
      title: "Wellness Activities",
      description: "Engage in therapeutic exercises, games, and mindfulness practices",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  const exercises = [
    { name: "Breathing Exercise", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200", gradient: "from-blue-600 to-purple-600" },
    { name: "Mindfulness Game", image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200", gradient: "from-green-600 to-blue-600" },
    { name: "Thought Journal", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200", gradient: "from-purple-600 to-pink-600" }
  ];

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
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/api/login"}
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Login
              </Button>
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 dark:text-white mb-6">
              Your Journey to
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Mental Wellness</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Discover peace, track your mood, and build healthier habits with our AI-powered mental health companion
            </p>
            <Button 
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Your Wellness Journey
            </Button>
          </motion.div>

          {/* Hero Images */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
            ].map((src, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -10 }}
                className="transform transition-transform duration-300"
              >
                <img 
                  src={src} 
                  alt={`Wellness image ${index + 1}`}
                  className="rounded-2xl shadow-lg w-full h-64 object-cover" 
                />
              </motion.div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center mb-4`}>
                      <feature.icon className="text-white w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Exercises Preview */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">Wellness Exercises & Activities</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">Interactive activities designed to boost your mental wellbeing</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <img 
                      src={exercise.image} 
                      alt={exercise.name}
                      className="w-full h-32 object-cover rounded-xl mb-4" 
                    />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{exercise.name}</h3>
                    <Button 
                      className={`w-full bg-gradient-to-r ${exercise.gradient} hover:shadow-lg transition-all duration-300 text-white`}
                      onClick={() => window.location.href = "/api/login"}
                    >
                      Try Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Preview */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">Your AI Wellness Companion</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">24/7 emotional support with personalized voice interaction</p>
          </motion.div>

          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <CardContent className="p-8">
              {/* Voice Settings Preview */}
              <div className="flex justify-center mb-8">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-full p-2 flex space-x-2">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                    <Heart className="w-4 h-4 mr-2" />
                    Female Voice
                  </Button>
                  <Button size="sm" variant="ghost" className="text-slate-600 dark:text-slate-300">
                    Male Voice
                  </Button>
                </div>
              </div>

              {/* Chat Preview */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 mb-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                    <Bot className="text-white w-4 h-4" />
                  </div>
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-md">
                    <p className="text-slate-800 dark:text-white">Hello! I'm here to support you today. How are you feeling right now?</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 justify-end">
                  <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl px-4 py-3 max-w-md">
                    <p className="text-white">I'm feeling a bit overwhelmed with work lately.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                    <Bot className="text-white w-4 h-4" />
                  </div>
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-md">
                    <p className="text-slate-800 dark:text-white">I understand that work stress can feel overwhelming. Would you like to try a quick breathing exercise together?</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                >
                  Start Chatting
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 dark:bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                  <Brain className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold">MindWell</span>
              </div>
              <p className="text-slate-400">Your trusted companion for mental wellness and emotional growth.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Mood Tracking</li>
                <li>AI Assistant</li>
                <li>Wellness Exercises</li>
                <li>Progress Analytics</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-2">
                  <Activity className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-2">
                  <BookOpen className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-2">
                  <Calendar className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 MindWell. All rights reserved. Supporting your mental wellness journey.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
