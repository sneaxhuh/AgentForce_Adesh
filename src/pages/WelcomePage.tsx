import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { BookOpen, Target, Users, Clock, ChevronRight, GraduationCap, Lightbulb, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, setUserProfile } = useAppContext();
  const { isAuthenticated, loading: authLoading } = useAuth(); // Get auth state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(userProfile);

  // Redirect if user is authenticated and has a profile
  useEffect(() => {
    if (!authLoading && isAuthenticated && userProfile.name) { // Assuming 'name' indicates a complete profile
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, userProfile.name, navigate]);

  const interestOptions = [
    'Artificial Intelligence', 'Machine Learning', 'Web Development', 'Mobile Development',
    'Data Science', 'Cybersecurity', 'Cloud Computing', 'Blockchain', 'Robotics',
    'Game Development', 'UI/UX Design', 'DevOps', 'Finance', 'Biology', 'Physics',
    'Chemistry', 'Business', 'Marketing', 'Psychology', 'Literature'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    const currentInterests = formData.interests;
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    
    handleInputChange('interests', updatedInterests);
  };

  const handleSubmit = () => {
    setUserProfile(formData);
    navigate('/dashboard');
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.name && formData.academicLevel;
      case 2: return formData.careerGoals.trim().length > 0;
      case 3: return formData.interests.length > 0;
      case 4: return formData.currentSkills.trim().length > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-teal-600">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
                <GraduationCap className="text-white" size={32} />
                <span className="text-2xl font-bold text-white">AcademicAI</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Your Smart Academic
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Planning Assistant
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Get personalized semester plans, project guidance, and career roadmaps powered by AI.
              From goal-setting to graduation – we've got you covered.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Target className="text-yellow-400 mx-auto mb-3" size={32} />
                <h3 className="text-white font-semibold mb-2">Smart Planning</h3>
                <p className="text-blue-100 text-sm">AI-powered semester plans tailored to your goals</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Lightbulb className="text-yellow-400 mx-auto mb-3" size={32} />
                <h3 className="text-white font-semibold mb-2">Project Guidance</h3>
                <p className="text-blue-100 text-sm">Step-by-step implementation with GitHub templates</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Award className="text-yellow-400 mx-auto mb-3" size={32} />
                <h3 className="text-white font-semibold mb-2">Progress Tracking</h3>
                <p className="text-blue-100 text-sm">Monitor your learning journey with smart insights</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="bg-gray-50 px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Let's Get Started</h2>
              <span className="text-sm font-medium text-gray-500">Step {currentStep} of 4</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <BookOpen className="mx-auto text-blue-600 mb-4" size={48} />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h3>
                  <p className="text-gray-600">Help us understand your academic background</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's your name?
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Level
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'high-school', label: 'High School', icon: BookOpen },
                      { value: 'undergrad', label: 'Undergraduate', icon: GraduationCap },
                      { value: 'postgrad', label: 'Postgraduate', icon: Award }
                    ].map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => handleInputChange('academicLevel', level.value)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.academicLevel === level.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <level.icon className="mx-auto mb-2" size={24} />
                        <span className="font-medium">{level.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Career Goals */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Target className="mx-auto text-blue-600 mb-4" size={48} />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">What are your goals?</h3>
                  <p className="text-gray-600">Share your career aspirations and academic objectives</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Career & Academic Goals
                  </label>
                  <textarea
                    value={formData.careerGoals}
                    onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Describe your career goals, what you want to achieve, and where you see yourself in the future..."
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Be specific about your aspirations - this helps us create a better plan for you.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Interests */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Users className="mx-auto text-blue-600 mb-4" size={48} />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">What interests you?</h3>
                  <p className="text-gray-600">Select areas you're passionate about or want to explore</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select your interests (choose multiple)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          formData.interests.includes(interest)
                            ? 'bg-blue-500 text-white shadow-md transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    Selected: {formData.interests.length} interests
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Skills & Time */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Clock className="mx-auto text-blue-600 mb-4" size={48} />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Skills & Availability</h3>
                  <p className="text-gray-600">Tell us about your current skills and study time</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Skills & Experience
                  </label>
                  <textarea
                    value={formData.currentSkills}
                    onChange={(e) => handleInputChange('currentSkills', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="List your current skills, programming languages, tools you know, relevant experience, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weekly Study Hours: {formData.weeklyStudyHours} hours
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={formData.weeklyStudyHours}
                    onChange={(e) => handleInputChange('weeklyStudyHours', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5 hours</span>
                    <span>20 hours</span>
                    <span>40+ hours</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isStepValid()
                      ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:shadow-lg transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ChevronRight size={16} className="ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isStepValid()}
                  className={`flex items-center px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isStepValid()
                      ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:shadow-lg transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Generate My Plan
                  <ChevronRight size={16} className="ml-2" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomePage;