import React, { useState, useEffect } from 'react';
import { useAppContext, WeeklyGoal } from '../contexts/AppContext';
import { generateProgressNudge } from '../services/aiService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { EMAIL_API_BASE_URL } from '../constants/api';

import {
  Calendar,
  CheckCircle2,
  Circle,
  TrendingUp,
  Target,
  Clock,
  Plus,
  Trash2,
  MessageCircle,
  Mail,
  RefreshCw,
  Save
} from 'lucide-react';


const ProgressPage: React.FC = () => {
  const { userProfile, setUserProfile, weeklyGoals, setWeeklyGoals, semesterPlans } = useAppContext();
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDueDate, setNewGoalDueDate] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState('');
  const [isLoadingMotivation, setIsLoadingMotivation] = useState(false);
  const [emailReminders, setEmailReminders] = useState(userProfile.emailRemindersEnabled || false);
  const [recipientEmail, setRecipientEmail] = useState(userProfile.reminderEmail || '');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const getMotivation = async () => {
    setIsLoadingMotivation(true);
    try {
      const nudge = await generateProgressNudge(userProfile, weeklyGoals, semesterPlans);
      setMotivationMessage(nudge);
    } catch (error) {
      console.error('Failed to get motivation:', error);
      setMotivationMessage('Failed to load motivation. Please try again later.');
    } finally {
      setIsLoadingMotivation(false);
    }
  };

  const completedGoalsCount = weeklyGoals.filter(goal => goal.completed).length;
  const completionPercentage = weeklyGoals.length > 0 ? (completedGoalsCount / weeklyGoals.length) * 100 : 0;

  useEffect(() => {
    // Send weekly reminder email if enabled and email is set
    if (emailReminders && (recipientEmail || userProfile.reminderEmail)) {
      const lastReminderSent = localStorage.getItem('academicPlanner_lastEmailReminderSent');
      const today = new Date().getTime();
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds

      if (!lastReminderSent || (today - parseInt(lastReminderSent, 10) > oneWeek)) {
        const pendingGoals = weeklyGoals.filter(goal => !goal.completed);
        const completedGoals = weeklyGoals.filter(goal => goal.completed);

        let emailSubject = "Academic Planner: Weekly Progress Update";
        let emailText = "";
        let emailHtml = "";

        if (weeklyGoals.length === 0) {
          emailText = "You currently have no tasks assigned. Time to plan some new goals!";
          emailHtml = "<p>You currently have no tasks assigned. Time to plan some new goals!</p>";
        } else if (pendingGoals.length > 0) {
          emailText = `You have ${pendingGoals.length} pending tasks:\n\n`;
          emailHtml = `<p>You have ${pendingGoals.length} pending tasks:</p><ul>`;
          pendingGoals.forEach(goal => {
            emailText += `- ${goal.title} (Due: ${new Date(goal.dueDate).toLocaleDateString()})\n`;
            emailHtml += `<li>${goal.title} (Due: ${new Date(goal.dueDate).toLocaleDateString()})</li>`;
          });
          emailHtml += `</ul>`;
        } else {
          emailText = "Great job! All your tasks are completed for this week.";
          emailHtml = "<p>Great job! All your tasks are completed for this week.</p>";
        }

        // Add overall progress
        emailText += `\n\nOverall Progress: ${completionPercentage.toFixed(0)}%`;
        emailHtml += `<p><b>Overall Progress: ${completionPercentage.toFixed(0)}%</b></p>`;

        // Send email via backend
        fetch(`${EMAIL_API_BASE_URL}/send-reminder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipientEmail || userProfile.reminderEmail,
            subject: emailSubject,
            text: emailText,
            html: emailHtml,
          }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            console.log('Weekly reminder email sent:', data.message);
            localStorage.setItem('academicPlanner_lastEmailReminderSent', today.toString());
          } else {
            console.error('Failed to send weekly reminder email:', data.error);
          }
        })
        .catch(error => {
          console.error('Error sending weekly reminder email:', error);
        });
      }
    }
  }, [emailReminders, weeklyGoals, completionPercentage, recipientEmail, userProfile.reminderEmail]);

  const addGoal = () => {
    if (newGoalTitle.trim() && newGoalDueDate) {
      const newGoal: WeeklyGoal = {
        id: Date.now().toString(),
        title: newGoalTitle.trim(),
        dueDate: newGoalDueDate,
        completed: false,
      };
      setWeeklyGoals([...weeklyGoals, newGoal]);
      setNewGoalTitle('');
      setNewGoalDueDate('');
      setIsAddingGoal(false);
    }
  };

  const toggleGoal = (id: string) => {
    setWeeklyGoals(
      weeklyGoals.map(goal =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const deleteGoal = (id: string) => {
    setWeeklyGoals(weeklyGoals.filter(goal => goal.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Study Hours/Week</p>
              <p className="text-2xl font-bold">{userProfile.weeklyStudyHours}h</p>
            </div>
            <Clock size={32} className="text-orange-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Goals */}
        <div
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Goals</h2>
            {!isAddingGoal && (
              <button
                onClick={() => setIsAddingGoal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span>Add New Goal</span>
              </button>
            )}
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
            <div
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
              <input
                type="date"
                value={newGoalDueDate}
                onChange={(e) => setNewGoalDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mt-2"
              />
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={addGoal}
                  disabled={!newGoalTitle.trim() || !newGoalDueDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
            </div>
          )}

          {/* Goals List */}
          <div>
            <div className="space-y-3">
              {weeklyGoals.map((goal, index) => (
                <div key={goal.id} value={goal}>
                  <div
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
                  </div>
                </div>
              ))}

              {weeklyGoals.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Target size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No goals set yet. Add your first goal to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {/* Sidebar */}
        <div
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

          {/* Email Reminders */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="text-green-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Email Reminders</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="reminderEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    id="reminderEmail"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={async () => {
                      if (!recipientEmail) {
                        alert('Please enter a valid email address.');
                        return;
                      }
                      
                      setIsSavingEmail(true);
                      try {
                        // Save email to user profile in Firebase
                        const updatedProfile = {
                          ...userProfile,
                          reminderEmail: recipientEmail,
                          emailRemindersEnabled: emailReminders
                        };
                        await setUserProfile(updatedProfile);
                        alert('Email address saved successfully!');
                      } catch (error) {
                        console.error('Failed to save email address:', error);
                        alert('Failed to save email address. Please try again.');
                      } finally {
                        setIsSavingEmail(false);
                      }
                    }}
                    disabled={isSavingEmail}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save size={16} className="mr-1" />
                    <span>{isSavingEmail ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Weekly Email Reminders</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Get progress updates via email</p>
                </div>
                <button
                  onClick={async () => {
                    const newEmailReminders = !emailReminders;
                    setEmailReminders(newEmailReminders);
                    
                    // Update Firebase with the new setting
                    try {
                      const updatedProfile = {
                        ...userProfile,
                        emailRemindersEnabled: newEmailReminders,
                        reminderEmail: recipientEmail || userProfile.reminderEmail
                      };
                      await setUserProfile(updatedProfile);
                      
                      if (newEmailReminders) {
                        // Send initial registration email or confirmation
                        try {
                          await fetch(`${EMAIL_API_BASE_URL}/send-reminder`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              to: recipientEmail || userProfile.reminderEmail,
                              subject: 'Academic Planner: Reminders Enabled',
                              text: 'You have successfully enabled weekly progress reminders.',
                              html: '<b>You have successfully enabled weekly progress reminders.</b>',
                            }),
                          });
                          alert('Weekly email reminders enabled! Check your inbox.');
                        } catch (error) {
                          console.error('Failed to send confirmation email:', error);
                          alert('Failed to enable reminders. Please try again.');
                          setEmailReminders(false); // Revert toggle on error
                        }
                      } else {
                        // Optionally, send a deactivation email or just confirm locally
                        alert('Weekly email reminders disabled.');
                      }
                    } catch (error) {
                      console.error('Failed to update email reminder settings:', error);
                      alert('Failed to update settings. Please try again.');
                      setEmailReminders(!newEmailReminders); // Revert toggle on error
                    }
                  }}
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
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;