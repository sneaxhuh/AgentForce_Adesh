import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { generateProgressNudge } from '../services/aiService';
import {
  Calendar,
  CheckCircle2,
  Circle,
  TrendingUp,
  Award,
  Target,
  Clock,
  Plus,
  Trash2,
  MessageCircle,
  Mail,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProgressPage: React.FC = () => {
  const { userProfile, weeklyGoals, setWeeklyGoals, semesterPlans } = useAppContext();
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState('');
  const [isLoadingMotivation, setIsLoadingMotivation] = useState(false);
  const [emailReminders, setEmailReminders] = useState(false);

  useEffect(() => {
    // Initialize with some default goals if none exist
    if (weeklyGoals.length === 0) {
      const defaultGoals = [
        {
          id: '1',
          title: 'Complete first course module',
          completed: false,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: '2',
          title: 'Start working on project',
          completed: true,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: '3',
          title: 'Read research paper',
          completed: false,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];
      setWeeklyGoals(defaultGoals);
    }
  }, [weeklyGoals.length, setWeeklyGoals]);

  const addGoal = () => {
    if (!newGoalTitle.trim()) return;

    const newGoal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      completed: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setWeeklyGoals([...weeklyGoals, newGoal]);
    setNewGoalTitle('');
    setIsAddingGoal(false);
  };

  const toggleGoal = (goalId: string) => {
    setWeeklyGoals(
      weeklyGoals.map(goal =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const deleteGoal = (goalId: string) => {
    setWeeklyGoals(weeklyGoals.filter(goal => goal.id !== goalId));
  };

  const getMotivation = async () => {
    setIsLoadingMotivation(true);
    try {
      const message = await generateProgressNudge(userProfile);
      setMotivationMessage(message);
    } catch (error) {
      console.error('Failed to get motivation:', error);
    } finally {
      setIsLoadingMotivation(false);
    }
  };

  const completedGoalsCount = weeklyGoals.filter(goal => goal.completed).length;
  const completionPercentage = weeklyGoals.length > 0 ? (completedGoalsCount / weeklyGoals.length) * 100 : 0;

  // Calculate milestones based on semester plans
  const totalMilestones = semesterPlans.length * 4; // Assuming 4 milestones per semester
  const completedMilestones = Math.floor((completionPercentage / 100) * totalMilestones);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Overall Progress</p>
              <p className="text-2xl font-bold">{completionPercentage.toFixed(0)}%</p>
            </div>
            <TrendingUp size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed Goals</p>
              <p className="text-2xl font-bold">{completedGoalsCount}/{weeklyGoals.length}</p>
            </div>
            <CheckCircle2 size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Milestones</p>
              <p className="text-2xl font-bold">{completedMilestones}/{totalMilestones}</p>
            </div>
            <Award size={32} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Study Hours/Week</p>
              <p className="text-2xl font-bold">{userProfile.weeklyStudyHours}h</p>
            </div>
            <Clock size={32} className="text-orange-200" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Target className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Goals</h2>
            </div>
            
            <button
              onClick={() => setIsAddingGoal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>Add Goal</span>
            </button>
          </div>

          {/* Progress Overview */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">This Week's Progress</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{completedGoalsCount} of {weeklyGoals.length} goals</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Add Goal Form */}
          {isAddingGoal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <input
                type="text"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="Enter your goal..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                autoFocus
              />
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={addGoal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Goal
                </button>
                <button
                  onClick={() => {
                    setIsAddingGoal(false);
                    setNewGoalTitle('');
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Goals List */}
          <div className="space-y-3">
            {weeklyGoals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  goal.completed
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleGoal(goal.id)}
                    className="flex-shrink-0"
                  >
                    {goal.completed ? (
                      <CheckCircle2 className="text-green-600" size={20} />
                    ) : (
                      <Circle className="text-gray-400" size={20} />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <p className={`font-medium ${
                      goal.completed
                        ? 'text-green-800 dark:text-green-200 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {goal.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Due: {new Date(goal.dueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}

            {weeklyGoals.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Target size={48} className="mx-auto mb-4 opacity-50" />
                <p>No goals set yet. Add your first goal to get started!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* AI Motivation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <MessageCircle className="text-purple-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Motivation</h3>
            </div>
            
            {motivationMessage ? (
              <div className="mb-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                  <p className="text-purple-800 dark:text-purple-200 text-sm italic">
                    "{motivationMessage}"
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Get personalized motivation and study tips based on your progress.
              </p>
            )}

            <button
              onClick={getMotivation}
              disabled={isLoadingMotivation}
              className="w-full flex items-center justify-center space-x-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoadingMotivation ? 'animate-spin' : ''} />
              <span>{isLoadingMotivation ? 'Getting Motivation...' : 'Get Motivation'}</span>
            </button>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="text-blue-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Timeline</h3>
            </div>

            <div className="space-y-4">
              {/* Mock milestones */}
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Course Module 1</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Completed 2 days ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Project Setup</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">In progress</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Certification Exam</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Due in 2 weeks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Reminders */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="text-green-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reminders</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Weekly Email Reminders</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Get progress updates via email</p>
                </div>
                <button
                  onClick={() => setEmailReminders(!emailReminders)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    emailReminders ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {emailReminders && (
                <div className="text-xs text-green-600 dark:text-green-400">
                  ✓ Email reminders enabled
                </div>
              )}
            </div>
          </div>

          {/* Progress Chart Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="text-orange-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Progress Chart</h3>
            </div>
            
            <div className="h-32 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Chart visualization coming soon</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressPage;