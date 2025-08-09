import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import {
  BookOpen,
  Target,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  Moon,
  Sun,
  GraduationCap
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { darkMode, setDarkMode } = useAppContext();
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', icon: Calendar, label: 'Dashboard' },
    { path: '/progress', icon: BarChart3, label: 'Progress' },
    { path: '/notes', icon: FileText, label: 'Notes' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (location.pathname === '/') {
    return <div className={darkMode ? 'dark' : ''}>{children}</div>;
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0">
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-blue-600 to-teal-600">
            <Link to="/dashboard" className="flex items-center space-x-2 text-white">
              <GraduationCap size={28} />
              <span className="text-lg font-bold">AcademicAI</span>
            </Link>
          </div>
          
          <nav className="mt-8 px-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-4 border-blue-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon size={20} className="mr-3" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Top Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Academic Planner
              </h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;