import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '../firebase'; // Import db from firebase
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext'; // Import useAuth to get current user

export interface UserProfile {
  name: string;
  academicLevel: 'high-school' | 'undergrad' | 'postgrad' | '';
  careerGoals: string;
  interests: string[];
  currentSkills: string;
  weeklyStudyHours: number;
  reminderEmail?: string;
  emailRemindersEnabled?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  semester: number;
  steps: string[];
  completed: boolean;
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
    completed: boolean; // Added completed property
  }[];
  certifications: { title: string; platform: string; difficulty: string; link: string; completed: boolean }[]; // Added completed property
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
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // Get user from AuthContext
  const [userProfile, setUserProfileState] = useState<UserProfile>(defaultUserProfile);
  const [semesterPlans, setSemesterPlansState] = useState<SemesterPlan[]>([]);
  const [weeklyGoals, setWeeklyGoalsState] = useState<WeeklyGoal[]>([]);
  const [notes, setNotesState] = useState<Note[]>([]);
  const [darkMode, setDarkModeState] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [appDataLoading, setAppDataLoading] = useState(true);

  // Fetch data from Firestore when user is authenticated
  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated && user) {
        setAppDataLoading(true);
        const userId = user.uid;

        // Fetch User Profile
        const profileDocRef = doc(db, 'users', userId, 'userProfile', 'profile');
        const profileSnap = await getDoc(profileDocRef);
        if (profileSnap.exists()) {
          setUserProfileState(profileSnap.data() as UserProfile);
        } else {
          // If no profile exists, create a default one
          await setDoc(profileDocRef, defaultUserProfile);
          setUserProfileState(defaultUserProfile);
        }

        // Fetch Semester Plans
        const semesterPlansColRef = collection(db, 'users', userId, 'semesterPlans');
        const q = query(semesterPlansColRef, orderBy('semester', 'asc')); // Add orderBy
        const semesterPlansSnapshot = await getDocs(q); // Use the query
        const fetchedSemesterPlans: SemesterPlan[] = semesterPlansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SemesterPlan));
        setSemesterPlansState(fetchedSemesterPlans);

        // Fetch Weekly Goals
        const weeklyGoalsColRef = collection(db, 'users', userId, 'weeklyGoals');
        const weeklyGoalsSnapshot = await getDocs(weeklyGoalsColRef);
        const fetchedWeeklyGoals: WeeklyGoal[] = weeklyGoalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeeklyGoal));
        setWeeklyGoalsState(fetchedWeeklyGoals);

        // Fetch Notes
        const notesColRef = collection(db, 'users', userId, 'notes');
        const notesSnapshot = await getDocs(notesColRef);
        const fetchedNotes: Note[] = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
        setNotesState(fetchedNotes);

        // Fetch Dark Mode setting
        const darkModeDocRef = doc(db, 'users', userId, 'settings', 'darkMode');
        const darkModeSnap = await getDoc(darkModeDocRef);
        if (darkModeSnap.exists()) {
          setDarkModeState(darkModeSnap.data().enabled);
        } else {
          await setDoc(darkModeDocRef, { enabled: false });
          setDarkModeState(false);
        }

        setAppDataLoading(false);
      } else if (!isAuthenticated && !authLoading) {
        // Clear data if user logs out
        setUserProfileState(defaultUserProfile);
        setSemesterPlansState([]);
        setWeeklyGoalsState([]);
        setNotesState([]);
        setDarkModeState(false);
        setAppDataLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, authLoading]); // Re-run when auth state changes

  // Setter functions that write to Firestore
  const setUserProfile = async (profile: UserProfile) => {
    if (user) {
      const profileDocRef = doc(db, 'users', user.uid, 'userProfile', 'profile');
      await setDoc(profileDocRef, profile);
      setUserProfileState(profile);
    }
  };

  const setSemesterPlans = async (plans: SemesterPlan[]) => {
    if (user) {
      const userId = user.uid;
      // Clear existing plans and add new ones
      const semesterPlansColRef = collection(db, 'users', userId, 'semesterPlans');
      const existingPlans = await getDocs(semesterPlansColRef);
      existingPlans.docs.forEach(async (d) => await deleteDoc(doc(db, 'users', userId, 'semesterPlans', d.id))); // Need deleteDoc

      plans.forEach(async (plan) => {
        const newPlanRef = doc(semesterPlansColRef); // Auto-generate ID
        await setDoc(newPlanRef, plan);
      });
      setSemesterPlansState(plans);
    }
  };

  const setWeeklyGoals = async (goals: WeeklyGoal[]) => {
    if (user) {
      const userId = user.uid;
      const weeklyGoalsColRef = collection(db, 'users', userId, 'weeklyGoals');
      const existingGoals = await getDocs(weeklyGoalsColRef);
      existingGoals.docs.forEach(async (d) => await deleteDoc(doc(db, 'users', userId, 'weeklyGoals', d.id))); // Need deleteDoc

      goals.forEach(async (goal) => {
        const newGoalRef = doc(weeklyGoalsColRef); // Auto-generate ID
        await setDoc(newGoalRef, goal);
      });
      setWeeklyGoalsState(goals);
    }
  };

  const setNotes = async (notesData: Note[]) => {
    if (user) {
      const userId = user.uid;
      const notesColRef = collection(db, 'users', userId, 'notes');
      const existingNotes = await getDocs(notesColRef);
      existingNotes.docs.forEach(async (d) => await deleteDoc(doc(db, 'users', userId, 'notes', d.id))); // Need deleteDoc

      notesData.forEach(async (note) => {
        const newNoteRef = doc(notesColRef); // Auto-generate ID
        await setDoc(newNoteRef, note);
      });
      setNotesState(notesData);
    }
  };

  const setDarkMode = async (enabled: boolean) => {
    if (user) {
      const darkModeDocRef = doc(db, 'users', user.uid, 'settings', 'darkMode');
      await setDoc(darkModeDocRef, { enabled });
      setDarkModeState(enabled);
    }
  };

  if (authLoading || appDataLoading) {
    return <div>Loading application data...</div>; // Or a proper loading spinner
  }

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