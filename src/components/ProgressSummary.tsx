import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ProgressSummaryProps {
  onClose: () => void;
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({ onClose }) => {
  const { weeklyGoals, userProfile } = useAppContext();

  const lastWeekGoals = weeklyGoals.filter(goal => {
    const dueDate = new Date(goal.dueDate);
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return dueDate >= lastWeek && dueDate <= today;
  });

  const completedGoals = lastWeekGoals.filter(goal => goal.completed);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg shadow-lg mb-6 relative"
    >
      <button onClick={onClose} className="absolute top-2 right-2 text-white hover:text-gray-200">
        <X size={20} />
      </button>
      <h2 className="text-2xl font-bold mb-2">Weekly Progress Summary</h2>
      <p className="mb-4">Here's how you did last week:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-lg font-semibold">Goals Completed</p>
          <p className="text-3xl font-bold">{completedGoals.length} / {lastWeekGoals.length}</p>
        </div>
        <div>
          <p className="text-lg font-semibold">Study Hours</p>
          <p className="text-3xl font-bold">{userProfile.weeklyStudyHours}h</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressSummary;