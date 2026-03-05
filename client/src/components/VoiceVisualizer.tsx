import { motion } from "framer-motion";

interface VoiceVisualizerProps {
  isActive: boolean;
  barCount?: number;
}

export default function VoiceVisualizer({ isActive, barCount = 5 }: VoiceVisualizerProps) {
  const generateBars = () => {
    const bars = [];
    
    for (let i = 0; i < barCount; i++) {
      bars.push(
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-blue-600 to-green-600 rounded-full"
          animate={isActive ? {
            height: [10, 30, 15, 25, 10],
            opacity: [0.6, 1, 0.8, 1, 0.6]
          } : {
            height: 10,
            opacity: 0.3
          }}
          transition={{
            duration: 1.5,
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut",
            delay: i * 0.1
          }}
        />
      );
    }
    
    return bars;
  };

  return (
    <div className="flex items-end justify-center space-x-1 h-12">
      {generateBars()}
    </div>
  );
}
