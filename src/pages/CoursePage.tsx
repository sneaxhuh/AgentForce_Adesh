import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext, SemesterPlan } from '../contexts/AppContext';
import { generateCourseRecommendations } from '../services/aiService';
import {
  BookOpen,
  GraduationCap,
  ClipboardList,
  FlaskConical,
  BrainCircuit,
  RefreshCw,
  Award,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

type CourseType = SemesterPlan['courses'][0];

const CoursePage = () => {
  const { darkMode, semesterPlans, setSemesterPlans } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { course } = location.state as { course: CourseType } || {};

  const [aiRecommendations, setAiRecommendations] = useState({
    studyPlan: '',
    certifications: [],
    projectIdeas: [],
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const generateAIRecommendations = async () => {
    setIsGeneratingAI(true);
    try {
      const recommendations = await generateCourseRecommendations(course.title, course.description);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
      // Optionally, set an error state or display a message to the user
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (!course) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">Course data is not available. Please go back and select a course.</p>
      </div>
    );
  }

  return (
    <div className={`p-6 ${darkMode ? 'dark' : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-6"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
      </motion.div>
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <BookOpen className="w-8 h-8 mr-4 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
        </div>

        {/* Course Details */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <GraduationCap className="w-6 h-6 mr-3 text-blue-600" />
            Course Details
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            {course.description && (
              <div>
                <h3 className="font-semibold text-lg mb-1">Description:</h3>
                <p>{course.description}</p>
              </div>
            )}
            {course.learningObjectives && course.learningObjectives.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-1">Learning Objectives:</h3>
                <ul className="list-disc list-inside">
                  {course.learningObjectives.map((obj, idx) => <li key={idx}>{obj}</li>)}
                </ul>
              </div>
            )}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-1">Prerequisites:</h3>
                <ul className="list-disc list-inside">
                  {course.prerequisites.map((req, idx) => <li key={idx}>{req}</li>)}
                </ul>
              </div>
            )}
            {course.recommendedResources && course.recommendedResources.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-1">Recommended Resources:</h3>
                <ul className="list-disc list-inside">
                  {course.recommendedResources.map((res, idx) => (
                    <li key={idx}>
                      <a href={res.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                        {res.title} ({res.type})
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg mb-1">Status:</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={course.completed}
                  onChange={(e) => {
                    const updatedPlans = semesterPlans.map(plan => ({
                      ...plan,
                      courses: plan.courses.map(c => 
                        c.title === course.title ? { ...c, completed: e.target.checked } : c
                      )
                    }));
                    setSemesterPlans(updatedPlans);
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-gray-700 dark:text-gray-300">
                  {course.completed ? 'Completed' : 'Mark as Complete'}
                </label>
              </div>
            </div>
            {course.assignmentsAndExams && course.assignmentsAndExams.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-1">Assignments & Exams:</h3>
                <ul className="list-disc list-inside">
                  {course.assignmentsAndExams.map((item, idx) => (
                    <li key={idx}>
                      {item.title} - Due: {item.dueDate} (Status: {item.status})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <BrainCircuit className="w-6 h-6 mr-3 text-purple-600" />
            AI Recommendations
          </h2>
          <button
            onClick={generateAIRecommendations}
            disabled={isGeneratingAI}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 mb-4"
          >
            <RefreshCw size={16} className={isGeneratingAI ? 'animate-spin' : ''} />
            <span>{isGeneratingAI ? 'Generating...' : 'Generate AI Recommendations'}</span>
          </button>

          {isGeneratingAI && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center shadow-inner"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mx-auto mb-3"></div>
              <p className="text-gray-700 dark:text-gray-300">Our AI is crafting personalized recommendations for you...</p>
            </motion.div>
          )}

          {!isGeneratingAI && aiRecommendations.studyPlan && (
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center"><ClipboardList className="w-5 h-5 mr-2" /> Suggested Study Plan:</h3>
                <ul className="list-disc list-inside space-y-2">
                  {aiRecommendations.studyPlan.split('Week ').filter(Boolean).map((week, idx) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Week {week.split(':')[0]}:</span> {week.split(':').slice(1).join(':').trim()}
                    </li>
                  ))}
                </ul>
              </div>
              {aiRecommendations.certifications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center"><Award className="w-5 h-5 mr-2" /> Related Certifications/MOOCs:</h3>
                  <ul className="list-disc list-inside">
                    {aiRecommendations.certifications.map((cert, idx) => (
                      <li key={idx}>
                        <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                          {cert.title} ({cert.platform})
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {aiRecommendations.projectIdeas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center"><FlaskConical className="w-5 h-5 mr-2" /> Project Ideas:</h3>
                  <ul className="list-disc list-inside">
                    {aiRecommendations.projectIdeas.map((project, idx) => (
                      <li key={idx}>
                        <span className="font-medium">{project.title}:</span> {project.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;