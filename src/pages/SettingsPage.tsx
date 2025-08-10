import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import {
  User,
  Target,
  Clock,
  Palette,
  Download,
  RefreshCw,
  Trash2,
  Save,
  Settings as SettingsIcon,
  Moon,
  Sun,
  FileDown,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    userProfile,
    setUserProfile,
    semesterPlans,
    weeklyGoals,
    notes,
    darkMode,
    setDarkMode,
    setSemesterPlans,
    setWeeklyGoals,
    setNotes
  } = useAppContext();

  const [editedProfile, setEditedProfile] = useState(userProfile);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const interestOptions = [
    'Artificial Intelligence', 'Machine Learning', 'Web Development', 'Mobile Development',
    'Data Science', 'Cybersecurity', 'Cloud Computing', 'Blockchain', 'Robotics',
    'Game Development', 'UI/UX Design', 'DevOps', 'Finance', 'Biology', 'Physics',
    'Chemistry', 'Business', 'Marketing', 'Psychology', 'Literature'
  ];

  const handleProfileUpdate = () => {
    setUserProfile(editedProfile);
    // You could show a success message here
  };

  const handleInterestToggle = (interest: string) => {
    const currentInterests = editedProfile.interests;
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    
    setEditedProfile(prev => ({ ...prev, interests: updatedInterests }));
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      
      // Title
      pdf.setFontSize(20);
      pdf.text('Academic Plan Export', 20, 30);
      
      // Profile Section
      pdf.setFontSize(16);
      pdf.text('Profile Information', 20, 50);
      pdf.setFontSize(12);
      pdf.text(`Name: ${userProfile.name}`, 20, 65);
      pdf.text(`Academic Level: ${userProfile.academicLevel.replace('-', ' ').toUpperCase()}`, 20, 75);
      pdf.text(`Weekly Study Hours: ${userProfile.weeklyStudyHours}`, 20, 85);
      
      // Career Goals
      pdf.text('Career Goals:', 20, 105);
      const goalLines = pdf.splitTextToSize(userProfile.careerGoals, 170);
      pdf.text(goalLines, 20, 115);
      
      // Interests
      let yPos = 115 + (goalLines.length * 5) + 15;
      pdf.text('Interests:', 20, yPos);
      pdf.text(userProfile.interests.join(', '), 20, yPos + 10);
      
      // Semester Plans
      yPos += 30;
      if (yPos > 250) {
        pdf.addPage();
        yPos = 30;
      }
      
      pdf.setFontSize(16);
      pdf.text('Semester Plans', 20, yPos);
      yPos += 15;
      
      semesterPlans.forEach((plan, index) => {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 30;
        }
        
        pdf.setFontSize(14);
        pdf.text(`Semester ${plan.semester}`, 20, yPos);
        yPos += 10;
        
        pdf.setFontSize(10);
        pdf.text('Courses:', 25, yPos);
        yPos += 5;
        plan.courses.forEach(course => {
          pdf.text(`• ${course.title}`, 30, yPos);
          yPos += 5;
        });
        
        yPos += 5;
        pdf.text('Projects:', 25, yPos);
        yPos += 5;
        plan.projects.forEach(project => {
          pdf.text(`• ${project.title}`, 30, yPos);
          yPos += 5;
        });
        
        yPos += 10;
      });
      
      // Save the PDF
      pdf.save(`academic-plan-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToMarkdown = () => {
    let markdown = `# Academic Plan Export\n\n`;
    markdown += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    // Profile Information
    markdown += `## Profile Information\n\n`;
    markdown += `- **Name**: ${userProfile.name}\n`;
    markdown += `- **Academic Level**: ${userProfile.academicLevel.replace('-', ' ').toUpperCase()}\n`;
    markdown += `- **Weekly Study Hours**: ${userProfile.weeklyStudyHours}\n`;
    markdown += `- **Interests**: ${userProfile.interests.join(', ')}\n\n`;
    
    // Career Goals
    markdown += `## Career Goals\n\n`;
    markdown += `${userProfile.careerGoals}\n\n`;
    
    // Semester Plans
    markdown += `## Semester Plans\n\n`;
    semesterPlans.forEach(plan => {
      markdown += `### Semester ${plan.semester}\n\n`;
      
      markdown += `**Courses:**\n`;
      plan.courses.forEach(course => {
        markdown += `- ${course.title}\n`;
      });
      
      markdown += `\n**Certifications:**\n`;
      plan.certifications.forEach(cert => {
        markdown += `- ${cert.title} (${cert.platform} - ${cert.difficulty})\n`;
      });
      
      markdown += `\n**Projects:**\n`;
      plan.projects.forEach(project => {
        markdown += `- **${project.title}** (${project.difficulty})\n`;
        markdown += `  ${project.description}\n`;
      });
      
      markdown += `\n`;
    });
    
    // Weekly Goals
    markdown += `## Current Weekly Goals\n\n`;
    weeklyGoals.forEach(goal => {
      const status = goal.completed ? '✅' : '⏳';
      markdown += `${status} ${goal.title} (Due: ${new Date(goal.dueDate).toLocaleDateString()})\n`;
    });
    
    // Create and download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic-plan-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAllData = () => {
    setSemesterPlans([]);
    setWeeklyGoals([]);
    setNotes([]);
    setUserProfile({
      name: '',
      email: '',
      academicLevel: '',
      careerGoals: '',
      interests: [],
      currentSkills: '',
      weeklyStudyHours: 10,
    });
    setShowResetModal(false);
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center space-x-3 mb-4">
          <SettingsIcon size={32} />
          <h1 className="text-3xl font-bold">Settings & Export</h1>
        </div>
        <p className="text-gray-300 text-lg">
          Manage your profile, preferences, and export your academic plan.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center space-x-3 mb-6">
            <User className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Academic Level
                </label>
                <select
                  value={editedProfile.academicLevel}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, academicLevel: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select level</option>
                  <option value="high-school">High School</option>
                  <option value="undergrad">Undergraduate</option>
                  <option value="postgrad">Postgraduate</option>
                </select>
              </div>
            </div>

            {/* Career Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Career Goals
              </label>
              <textarea
                value={editedProfile.careerGoals}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, careerGoals: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe your career goals..."
              />
            </div>

            {/* Current Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Skills
              </label>
              <textarea
                value={editedProfile.currentSkills}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, currentSkills: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="List your current skills and experience..."
              />
            </div>

            {/* Weekly Study Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weekly Study Hours: {editedProfile.weeklyStudyHours} hours
              </label>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={editedProfile.weeklyStudyHours}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, weeklyStudyHours: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>5 hours</span>
                <span>20 hours</span>
                <span>40+ hours</span>
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Interests ({editedProfile.interests.length} selected)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      editedProfile.interests.includes(interest)
                        ? 'bg-blue-500 text-white shadow-md transform scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleProfileUpdate}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Save size={16} />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </motion.div>

        {/* Sidebar Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="text-purple-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Appearance</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark theme</p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    darkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="text-green-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Export Data</h3>
            </div>

            <div className="space-y-3">
              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <FileDown size={16} />
                )}
                <span>{isExporting ? 'Generating...' : 'Export as PDF'}</span>
              </button>

              <button
                onClick={exportToMarkdown}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileDown size={16} />
                <span>Export as Markdown</span>
              </button>

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Exports include profile, plans, goals, and notes
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="text-red-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Data Management</h3>
            </div>

            <button
              onClick={() => setShowResetModal(true)}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={16} />
              <span>Reset All Data</span>
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              This will permanently delete all your data
            </p>
          </div>

          {/* App Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">App Information</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Total Plans:</strong> {semesterPlans.length}</p>
              <p><strong>Total Goals:</strong> {weeklyGoals.length}</p>
              <p><strong>Total Notes:</strong> {notes.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="text-red-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reset All Data</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to reset all data? This action cannot be undone and will permanently delete:
            </p>
            
            <ul className="text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
              <li>• Your profile information</li>
              <li>• All semester plans</li>
              <li>• Weekly goals and progress</li>
              <li>• All saved notes</li>
            </ul>

            <div className="flex space-x-3">
              <button
                onClick={resetAllData}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Yes, Reset Everything
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SettingsPage;