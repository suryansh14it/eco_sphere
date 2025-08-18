"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface XPAnimationProps {
  show: boolean;
  xp: number;
  onComplete: () => void;
}

export function XPAnimation({ show, xp, onComplete }: XPAnimationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [0.5, 1.2, 1],
              opacity: [0, 1, 1, 0]
            }}
            transition={{ 
              duration: 2.5,
              times: [0, 0.3, 0.5, 1]
            }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ 
                y: [0, -20],
                opacity: [1, 0]
              }}
              transition={{ delay: 1.5, duration: 1 }}
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-xl md:text-3xl px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
            >
              <Star className="h-5 w-5 md:h-7 md:w-7 text-yellow-300" />
              <span>+{xp} XP</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function useQuizToasts() {
  const { toast } = useToast();
  
  const showQuizCompletedToast = (score: number, xpEarned: number) => {
    toast({
      title: "Quiz Completed!",
      description: (
        <div className="flex flex-col gap-1">
          <div className="font-medium">You scored {score}%</div>
          <div className="flex items-center gap-1 text-emerald-600">
            <Award className="h-4 w-4" /> 
            <span>+{xpEarned} XP earned</span>
          </div>
        </div>
      ),
      variant: score >= 70 ? "default" : "destructive",
      duration: 5000,
    });
  };
  
  return { showQuizCompletedToast };
}
