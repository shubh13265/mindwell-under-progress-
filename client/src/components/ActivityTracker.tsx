import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Activity, Plus, CheckCircle, Clock, Leaf, Book, Dumbbell, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface ActivityItem {
  id: number;
  name: string;
  type: string;
  duration?: number;
  completed: boolean;
  createdAt: string;
}

interface ActivityTrackerProps {
  activities: ActivityItem[];
}

export default function ActivityTracker({ activities }: ActivityTrackerProps) {
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityType, setNewActivityType] = useState("");
  const [newActivityDuration, setNewActivityDuration] = useState<number | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const activityTypes = [
    { value: "meditation", label: "Meditation", icon: Leaf, color: "text-green-600" },
    { value: "exercise", label: "Exercise", icon: Dumbbell, color: "text-blue-600" },
    { value: "journaling", label: "Journaling", icon: Book, color: "text-purple-600" },
    { value: "breathing", label: "Breathing", icon: Heart, color: "text-pink-600" },
    { value: "walking", label: "Walking", icon: Activity, color: "text-amber-600" },
    { value: "reading", label: "Reading", icon: Book, color: "text-indigo-600" },
    { value: "other", label: "Other", icon: Activity, color: "text-slate-600" }
  ];

  const createActivityMutation = useMutation({
    mutationFn: async (data: { name: string; type: string; duration?: number }) => {
      await apiRequest("POST", "/api/activities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Activity Added",
        description: "Your wellness activity has been added to your tracker.",
      });
      setNewActivityName("");
      setNewActivityType("");
      setNewActivityDuration(undefined);
      setDialogOpen(false);
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
        description: "Failed to add activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeActivityMutation = useMutation({
    mutationFn: async (activityId: number) => {
      await apiRequest("POST", `/api/activities/${activityId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Activity Completed",
        description: "Great job! Keep up the good work.",
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
        description: "Failed to complete activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddActivity = () => {
    if (!newActivityName.trim() || !newActivityType) {
      toast({
        title: "Missing Information",
        description: "Please provide both activity name and type.",
        variant: "destructive",
      });
      return;
    }

    createActivityMutation.mutate({
      name: newActivityName.trim(),
      type: newActivityType,
      duration: newActivityDuration
    });
  };

  const handleCompleteActivity = (activityId: number) => {
    completeActivityMutation.mutate(activityId);
  };

  const getActivityIcon = (type: string) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.icon : Activity;
  };

  const getActivityColor = (type: string) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.color : "text-slate-600";
  };

  // Get today's activities
  const todayActivities = activities.filter(activity => {
    const activityDate = new Date(activity.createdAt);
    const today = new Date();
    return activityDate.toDateString() === today.toDateString();
  });

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span>Daily Activities</span>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Activity</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Activity Name
                  </label>
                  <Input
                    value={newActivityName}
                    onChange={(e) => setNewActivityName(e.target.value)}
                    placeholder="e.g., Morning meditation, Evening walk..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Activity Type
                  </label>
                  <Select value={newActivityType} onValueChange={setNewActivityType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <type.icon className={`w-4 h-4 ${type.color}`} />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Duration (minutes) - Optional
                  </label>
                  <Input
                    type="number"
                    value={newActivityDuration || ""}
                    onChange={(e) => setNewActivityDuration(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g., 15, 30, 60..."
                    min="1"
                  />
                </div>

                <Button 
                  onClick={handleAddActivity}
                  disabled={createActivityMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white"
                >
                  {createActivityMutation.isPending ? "Adding..." : "Add Activity"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayActivities && todayActivities.length > 0 ? (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {todayActivities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                    activity.completed 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-slate-50 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-green-400 dark:hover:border-green-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.completed 
                        ? 'bg-green-600' 
                        : 'bg-gradient-to-r from-slate-400 to-slate-500'
                    }`}>
                      <IconComponent className="text-white w-4 h-4" />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        activity.completed 
                          ? 'text-green-800 dark:text-green-200 line-through' 
                          : 'text-slate-800 dark:text-white'
                      }`}>
                        {activity.name}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="capitalize">{activity.type}</span>
                        {activity.duration && (
                          <>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{activity.duration} min</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={activity.completed ? "outline" : "default"}
                    onClick={() => !activity.completed && handleCompleteActivity(activity.id)}
                    disabled={activity.completed || completeActivityMutation.isPending}
                    className={activity.completed 
                      ? "text-green-600 border-green-600" 
                      : "bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-lg"
                    }
                  >
                    {activity.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-white rounded-full" />
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-2">No activities for today</p>
            <p className="text-sm text-slate-500 dark:text-slate-500">Add your first wellness activity!</p>
          </div>
        )}

        {/* Quick Add Suggestions */}
        {todayActivities.length === 0 && (
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">Quick Add:</h5>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "5-min Meditation", type: "meditation", duration: 5 },
                { name: "Morning Walk", type: "walking", duration: 20 },
                { name: "Gratitude Journal", type: "journaling", duration: 10 },
                { name: "Breathing Exercise", type: "breathing", duration: 5 }
              ].map((suggestion) => (
                <Button
                  key={suggestion.name}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewActivityName(suggestion.name);
                    setNewActivityType(suggestion.type);
                    setNewActivityDuration(suggestion.duration);
                    setDialogOpen(true);
                  }}
                  className="text-xs justify-start"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {suggestion.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
