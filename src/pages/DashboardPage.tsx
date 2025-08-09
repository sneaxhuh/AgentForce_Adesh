import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { generateSemesterPlan } from '../services/aiService';
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
import { motion } from 'framer-motion';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, semesterPlans, setSemesterPlans, setCurrentProject } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!userProfile.name) {
      navigate('/');
      return;
    }

    if (semesterPlans.length === 0 && isInitialLoad) {
      generatePlan();
    }
    setIsInitialLoad(false);
  }, [userProfile, semesterPlans.length, navigate, isInitialLoad]);

  const generatePlan = async () => {
    if (!userProfile.name) return;
    
    setIsGenerating(true);
    try {
      const plans = await generateSemesterPlan(userProfile);
      setSemesterPlans(plans);
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProjectClick = (project: any) => {
    setCurrentProject(project);
    navigate('/project-details');
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
          <div className="hidden md:block">
            <Sparkles size={64} className="text-yellow-400 opacity-80" />
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
      </motion.div>

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
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                      <BookOpen size={20} />
                      <h4 className="font-semibold">Recommended Courses</h4>
                    </div>
                    <div className="space-y-2">
                      {plan.courses.map((course, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">{course.title}</span>
                          <ExternalLink size={16} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <Award size={20} />
                      <h4 className="font-semibold">Certifications</h4>
                    </div>
                    <div className="space-y-2">
                      {plan.certifications.map((cert, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-white">{cert.title}</span>
                            <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                              {cert.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{cert.platform}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                      <Code2 size={20} />
                      <h4 className="font-semibold">Projects</h4>
                    </div>
                    <div className="space-y-2">
                      {plan.projects.map((project, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleProjectClick(project)}
                          className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-white">{project.title}</span>
                            <ChevronRight size={16} className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
                          <div className="mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              project.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' :
                              project.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
                              'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
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
                    <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                      <FileText size={20} />
                      <h4 className="font-semibold">Research Papers</h4>
                    </div>
                    <div className="space-y-2">
                      {plan.researchPapers.map((paper, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-white">{paper.title}</span>
                            <ExternalLink size={16} className="text-orange-600 dark:text-orange-400 hover:text-orange-800 cursor-pointer" />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {paper.abstract}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isGenerating && semesterPlans.length === 0 && !isInitialLoad && (
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