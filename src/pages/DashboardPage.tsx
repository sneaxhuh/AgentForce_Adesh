import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext, Project, SemesterPlan } from '../contexts/AppContext';
import { generateSemesterPlan } from '../services/aiService';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../constants/api';
import {
  BookOpen,
  Award,
  Code2,
  FileText,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Calendar,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, semesterPlans, setSemesterPlans, setCurrentProject } = useAppContext();
  const { logout, getIdToken } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePlan = useCallback(async () => {
    if (!userProfile.name) return;

    setIsGenerating(true);
    setError(null);
    try {
      const plans = await generateSemesterPlan(userProfile);
      setSemesterPlans(plans);
    } catch (error) {
      console.error('Failed to generate plan:', error);
      setError('Failed to generate your academic plan. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  }, [userProfile, setSemesterPlans]);

  useEffect(() => {
    if (!userProfile.name) {
      navigate('/');
      return;
    }

    
  }, [userProfile.name, semesterPlans.length, navigate, generatePlan]);

  const handleProjectClick = (project: Project) => {
    setCurrentProject(project);
    navigate('/project-details');
  };

  const handleCourseClick = (course: SemesterPlan['courses'][0]) => {
    navigate('/course', { state: { course } });
  };

  const sendGoalReminder = async () => {
    try {
      const idToken = await getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/send-goal-reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        alert('Goal status reminder sent successfully!');
      } else {
        alert('Failed to send goal status reminder.');
      }
    } catch (error) {
      console.error('Error sending goal status reminder:', error);
      alert('Failed to send goal status reminder.');
    }
  };

  if (!userProfile.name) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile.name}! 👋</h1>
            <p className="text-blue-100 text-lg">
              Ready to continue your learning journey? Here's your personalized academic roadmap.
            </p>
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <Target size={16} />
                <span className="text-sm">{userProfile.academicLevel.replace('-', ' ').toUpperCase()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span className="text-sm">{userProfile.weeklyStudyHours}h/week</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award size={16} />
                <span className="text-sm">{userProfile.interests.length} interests</span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <button onClick={logout} className="text-white bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors">Logout</button>
            <div className="hidden md:block ml-4">
              <Sparkles size={64} className="text-yellow-400 opacity-80" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Your Academic Plan</h2>
          <p className="text-gray-600 dark:text-gray-300">
            {semesterPlans.length} semesters planned • Last updated today
          </p>
        </div>
        <button
          onClick={generatePlan}
          disabled={isGenerating}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
          <span>{isGenerating ? 'Generating...' : 'Regenerate Plan'}</span>
        </button>
        <button
          onClick={sendGoalReminder}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <span>Send Goal Status</span>
        </button>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <FileText size={20} />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-700 dark:text-red-300 mt-2">{error}</p>
        </motion.div>
      )}

      

      {/* Loading State */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Generating Your Plan...</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Our AI is analyzing your goals and creating a personalized academic roadmap.
          </p>
        </motion.div>
      )}

      {/* Semester Plans */}
      {!isGenerating && semesterPlans.length > 0 && (
        <div className="space-y-6">
          {semesterPlans.map((plan, index) => (
            <motion.div
              key={plan.semester}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      {plan.semester}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Semester {plan.semester}
                    </h3>
                  </div>
                  <Calendar size={20} className="text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Courses */}
                  <div className="space-y-4">
                    <span className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                      <BookOpen size={20} />
                      <h4 className="font-bold">Recommended Courses</h4>
                    </span>
                    <div className="space-y-3">
                      {plan.courses.map((course, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleCourseClick(course)}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 cursor-pointer transition-all duration-200 hover:shadow-sm group"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">{course.title}</span>
                          <ChevronRight size={16} className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-4">
                    <span className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <Award size={20} />
                      <h4 className="font-bold">Certifications</h4>
                    </span>
                    <div className="space-y-3">
                      {plan.certifications.length > 0 ? (
                        plan.certifications.map((cert, idx) => (
                          <a
                            key={idx}
                            href={cert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800/50 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 transition-all duration-200 hover:shadow-sm"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-bold text-gray-900 dark:text-white">{cert.title}</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{cert.platform}</p>
                              </div>
                              <ExternalLink size={16} className="flex-shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
                            </div>
                            <div className="mt-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                cert.difficulty === 'Beginner' 
                                  ? 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200' :
                                cert.difficulty === 'Intermediate' 
                                  ? 'bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-200' :
                                  'bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-200'
                              }`}>
                                {cert.difficulty}
                              </span>
                            </div>
                          </a>
                        ))
                      ) : (
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/30">
                          <p className="text-gray-500 dark:text-gray-400 text-center">No relevant certifications found.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="space-y-4">
                    <span className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                      <Code2 size={20} />
                      <h4 className="font-bold">Projects</h4>
                    </span>
                    <div className="space-y-3">
                      {plan.projects.map((project, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleProjectClick(project)}
                          className="p-4 bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 rounded-xl border border-purple-200 dark:border-purple-800/50 hover:from-purple-100 hover:to-fuchsia-100 dark:hover:from-purple-800/30 dark:hover:to-fuchsia-800/30 cursor-pointer transition-all duration-200 hover:shadow-sm group"
                        >
                          <div className="flex items-start justify-between">
                            <h5 className="font-medium text-gray-900 dark:text-white">{project.title}</h5>
                            <ChevronRight size={16} className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform flex-shrink-0 mt-0.5" />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{project.description}</p>
                          <div className="mt-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              project.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200' :
                              project.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-200' :
                              'bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-200'
                            }`}>
                              {project.difficulty}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Research Papers */}
                  <div className="space-y-4">
                    <span className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                      <FileText size={20} />
                      <h4 className="font-bold">Research Papers</h4>
                    </span>
                    <div className="space-y-3">
                      {plan.researchPapers.length > 0 ? (
                        plan.researchPapers.map((paper, idx) => (
                          <a
                            key={idx}
                            href={paper.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800/50 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-800/30 dark:hover:to-amber-800/30 transition-all duration-200 hover:shadow-sm"
                          >
                            <div className="flex items-start justify-between">
                              <h5 className="font-medium text-gray-900 dark:text-white pr-2">{paper.title}</h5>
                              <ExternalLink size={16} className="flex-shrink-0 text-orange-600 dark:text-orange-400 mt-0.5" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                              {paper.abstract}
                            </p>
                            <div className="mt-3 flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-800/30 text-orange-800 dark:text-orange-200">
                                Research Paper
                              </span>
                            </div>
                          </a>
                        ))
                      ) : (
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800/30">
                          <p className="text-gray-500 dark:text-gray-400 text-center">No relevant research papers found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isGenerating && semesterPlans.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm"
        >
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Plan Generated Yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Click "Generate My Plan" to create your personalized academic roadmap.
          </p>
          <button
            onClick={generatePlan}
            className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Generate My Plan
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;