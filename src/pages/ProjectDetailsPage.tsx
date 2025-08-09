import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { generateProjectDetails, generateGitHubStructure } from '../services/aiService';
import {
  ArrowLeft,
  Code2,
  Github,
  Download,
  CheckCircle2,
  Circle,
  Folder,
  FileText,
  Copy,
  RefreshCw,
  ExternalLink,
  Lightbulb,
  Target,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentProject, setCurrentProject } = useAppContext();
  const [project, setProject] = useState(currentProject);
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
  const [isGeneratingRepo, setIsGeneratingRepo] = useState(false);
  const [repoStructure, setRepoStructure] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!currentProject) {
      navigate('/dashboard');
      return;
    }
  }, [currentProject, navigate]);

  const generateDetails = async () => {
    if (!project) return;
    
    setIsGeneratingDetails(true);
    try {
      const detailedProject = await generateProjectDetails(project.id);
      setProject({ ...project, ...detailedProject });
      setCurrentProject({ ...project, ...detailedProject });
    } catch (error) {
      console.error('Failed to generate project details:', error);
    } finally {
      setIsGeneratingDetails(false);
    }
  };

  const generateRepo = async () => {
    if (!project) return;
    
    setIsGeneratingRepo(true);
    try {
      const structure = await generateGitHubStructure(project);
      setRepoStructure(structure);
      setProject({ ...project, repoStructure: structure });
      setCurrentProject({ ...project, repoStructure: structure });
    } catch (error) {
      console.error('Failed to generate repo structure:', error);
    } finally {
      setIsGeneratingRepo(false);
    }
  };

  const toggleStepCompletion = (stepIndex: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepIndex) 
        ? prev.filter(s => s !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const exportRepo = () => {
    if (!repoStructure) return;
    
    // Create a simple text representation for download
    let content = '# Repository Structure\n\n';
    
    content += '## Folders\n';
    repoStructure.folders.forEach((folder: string) => {
      content += `- ${folder}\n`;
    });
    
    content += '\n## Files\n';
    repoStructure.files.forEach((file: any) => {
      content += `\n### ${file.name}\n\`\`\`\n${file.content}\n\`\`\`\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.title || 'project'}-structure.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!project) {
    return null;
  }

  const completionPercentage = project.steps ? 
    (completedSteps.length / project.steps.length) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            project.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {project.difficulty}
          </span>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Semester {project.semester}
          </span>
        </div>
      </motion.div>

      {/* Project Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-3">{project.title}</h1>
            <p className="text-purple-100 text-lg mb-6">{project.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Target className="text-purple-200" size={24} />
                <div>
                  <p className="text-sm text-purple-200">Difficulty</p>
                  <p className="font-semibold">{project.difficulty}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="text-purple-200" size={24} />
                <div>
                  <p className="text-sm text-purple-200">Timeline</p>
                  <p className="font-semibold">4-6 weeks</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="text-purple-200" size={24} />
                <div>
                  <p className="text-sm text-purple-200">Progress</p>
                  <p className="font-semibold">{completionPercentage.toFixed(0)}% Complete</p>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <Code2 size={64} className="text-purple-300 opacity-50" />
          </div>
        </div>

        {/* Progress Bar */}
        {project.steps && (
          <div className="mt-6">
            <div className="w-full bg-purple-500/30 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Implementation Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Lightbulb className="text-yellow-500" size={24} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Implementation Steps</h2>
              </div>
              <button
                onClick={generateDetails}
                disabled={isGeneratingDetails}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={isGeneratingDetails ? 'animate-spin' : ''} />
                <span>{isGeneratingDetails ? 'Generating...' : 'Enhance Details'}</span>
              </button>
            </div>

            {project.steps && (
              <div className="space-y-4">
                {project.steps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg transition-all duration-200 ${
                      completedSteps.includes(index.toString())
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => toggleStepCompletion(index.toString())}
                        className="mt-0.5"
                      >
                        {completedSteps.includes(index.toString()) ? (
                          <CheckCircle2 className="text-green-600" size={20} />
                        ) : (
                          <Circle className="text-gray-400" size={20} />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${
                            completedSteps.includes(index.toString())
                              ? 'text-green-800 dark:text-green-200 line-through'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            Step {index + 1}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Est. {Math.ceil((index + 1) * 0.5)} days
                          </span>
                        </div>
                        <p className={`mt-1 ${
                          completedSteps.includes(index.toString())
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {step}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isGeneratingDetails && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400">Generating detailed implementation guide...</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* GitHub Repository Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Repository Structure */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Github className="text-gray-700 dark:text-gray-300" size={24} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">GitHub Repository</h2>
            </div>

            <div className="space-y-4">
              <button
                onClick={generateRepo}
                disabled={isGeneratingRepo}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                <Github size={16} />
                <span>{isGeneratingRepo ? 'Generating...' : 'Generate Repository Structure'}</span>
                {isGeneratingRepo && <RefreshCw size={16} className="animate-spin" />}
              </button>

              {repoStructure && (
                <div className="space-y-4">
                  {/* Folder Structure */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <Folder size={16} className="mr-2" />
                      Folder Structure
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      {repoStructure.folders.map((folder: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                          <Folder size={14} className="text-blue-600" />
                          <span>{folder}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Files */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <FileText size={16} className="mr-2" />
                      Starter Files
                    </h3>
                    <div className="space-y-2">
                      {repoStructure.files.map((file: any, index: number) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white text-sm">{file.name}</span>
                            <button
                              onClick={() => copyToClipboard(file.content)}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                          <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded p-2 overflow-x-auto max-h-32">
                            {file.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={exportRepo}
                    className="w-full flex items-center justify-center space-x-2 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Download size={16} />
                    <span>Export as .md</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Resources & Links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <ExternalLink size={20} className="mr-2" />
              Helpful Resources
            </h2>
            
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <span className="text-blue-800 dark:text-blue-200 font-medium">Documentation</span>
                <ExternalLink size={16} className="text-blue-600" />
              </a>
              <a
                href="#"
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <span className="text-green-800 dark:text-green-200 font-medium">Video Tutorial</span>
                <ExternalLink size={16} className="text-green-600" />
              </a>
              <a
                href="#"
                className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <span className="text-purple-800 dark:text-purple-200 font-medium">Example Projects</span>
                <ExternalLink size={16} className="text-purple-600" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;