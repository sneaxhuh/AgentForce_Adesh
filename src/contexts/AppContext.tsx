import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface UserProfile {
  name: string;
  academicLevel: 'high-school' | 'undergrad' | 'postgrad' | '';
  careerGoals: string;
  interests: string[];
  currentSkills: string;
  weeklyStudyHours: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  semester: number;
  steps: string[];
  repoStructure?: {
    folders: string[];
    files: { name: string; content: string }[];
  };
}

export interface SemesterPlan {
  semester: number;
  courses: {
    title: string;
    link: string;
    description?: string;
    learningObjectives?: string[];
    prerequisites?: string[];
    recommendedResources?: { type: string; title: string; link: string }[];
  }[];
  certifications: { title: string; platform: string; difficulty: string }[];
  projects: Project[];
  researchPapers: { title: string; link: string; abstract: string }[];
}

export interface WeeklyGoal {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  aiSuggestions?: string[];
  summary?: string;
}

interface AppContextType {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  semesterPlans: SemesterPlan[];
  setSemesterPlans: (plans: SemesterPlan[]) => void;
  weeklyGoals: WeeklyGoal[];
  setWeeklyGoals: (goals: WeeklyGoal[]) => void;
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

const defaultUserProfile: UserProfile = {
  name: '',
  academicLevel: '',
  careerGoals: '',
  interests: [],
  currentSkills: '',
  weeklyStudyHours: 10,
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [semesterPlans, setSemesterPlans] = useState<SemesterPlan[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('academicPlanner_userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    const savedPlans = localStorage.getItem('academicPlanner_semesterPlans');
    if (savedPlans) {
      setSemesterPlans(JSON.parse(savedPlans));
    }

    const savedGoals = localStorage.getItem('academicPlanner_weeklyGoals');
    if (savedGoals) {
      setWeeklyGoals(JSON.parse(savedGoals));
    }

    const savedNotes = localStorage.getItem('academicPlanner_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }

    const savedDarkMode = localStorage.getItem('academicPlanner_darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('academicPlanner_userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('academicPlanner_semesterPlans', JSON.stringify(semesterPlans));
  }, [semesterPlans]);

  useEffect(() => {
    localStorage.setItem('academicPlanner_weeklyGoals', JSON.stringify(weeklyGoals));
  }, [weeklyGoals]);

  useEffect(() => {
    localStorage.setItem('academicPlanner_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('academicPlanner_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        semesterPlans,
        setSemesterPlans,
        weeklyGoals,
        setWeeklyGoals,
        notes,
        setNotes,
        darkMode,
        setDarkMode,
        currentProject,
        setCurrentProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};