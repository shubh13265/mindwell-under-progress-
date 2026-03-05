import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Mood {
  id: number;
  moodValue: number;
  note?: string;
  createdAt: string;
}

interface MoodTrackerProps {
  moods: Mood[];
}

export default function MoodTracker({ moods }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const moodOptions = [
    { value: 1, emoji: "😢", label: "Very Sad", color: "bg-red-100 text-red-500 hover:bg-red-200" },
    { value: 2, emoji: "😐", label: "Sad", color: "bg-orange-100 text-orange-500 hover:bg-orange-200" },
    { value: 3, emoji: "🙂", label: "Okay", color: "bg-yellow-100 text-yellow-500 hover:bg-yellow-200" },
    { value: 4, emoji: "😊", label: "Good", color: "bg-green-100 text-green-500 hover:bg-green-200" },
    { value: 5, emoji: "😄", label: "Great", color: "bg-blue-100 text-blue-500 hover:bg-blue-200" }
  ];

  const createMoodMutation = useMutation({
    mutationFn: async (data: { moodValue: number; note?: string }) => {
      await apiRequest("POST", "/api/moods", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Mood Recorded",
        description: "Your mood has been successfully tracked.",
      });
      setSelectedMood(null);
      setMoodNote("");
      setShowNoteInput(false);
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
        description: "Failed to record mood. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMoodSelect = (moodValue: number) => {
    setSelectedMood(moodValue);
    setShowNoteInput(true);
  };

  const handleSaveMood = () => {
    if (selectedMood === null) return;
    
    createMoodMutation.mutate({
      moodValue: selectedMood,
      note: moodNote.trim() || undefined
    });
  };

  const getMoodEmoji = (value: number) => {
    const mood = moodOptions.find(m => m.value === value);
    return mood?.emoji || "🙂";
  };

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Smile className="w-5 h-5 text-blue-600" />
          <span>Mood Tracker</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today's Mood Selection */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
          <h4 className="text-slate-700 dark:text-slate-200 font-medium mb-4">How are you feeling today?</h4>
          <div className="flex justify-between space-x-2">
            {moodOptions.map((mood) => (
              <motion.button
                key={mood.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMoodSelect(mood.value)}
                className={`w-12 h-12 rounded-full transition-all duration-200 ${mood.color} ${
                  selectedMood === mood.value ? 'ring-2 ring-blue-400 scale-110' : ''
                }`}
                title={mood.label}
              >
                <span className="text-xl">{mood.emoji}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Note Input */}
        <AnimatePresence>
          {showNoteInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Add a note (optional)
                </label>
                <Textarea
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="What's on your mind? How are you feeling..."
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleSaveMood}
                  disabled={createMoodMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-green-600 text-white flex-1"
                >
                  {createMoodMutation.isPending ? "Saving..." : "Save Mood"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNoteInput(false);
                    setSelectedMood(null);
                    setMoodNote("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood History */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-800 dark:text-white">Recent Moods</h4>
          {moods && moods.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {moods.slice(0, 5).map((mood) => (
                <motion.div
                  key={mood.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getMoodEmoji(mood.moodValue)}</span>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {new Date(mood.createdAt).toLocaleDateString()}
                      </p>
                      {mood.note && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-48">
                          {mood.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(mood.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Smile className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No mood entries yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">Track your first mood above!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
