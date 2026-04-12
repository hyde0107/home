import React, { createContext, useContext, useState, useEffect } from 'react';
import { Material, Task, WeeklyGoal, StudyPlan } from '../types';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

interface DataContextType {
  user: User | null;
  isConfigured: boolean;
  materials: Material[];
  tasks: Task[];
  weeklyGoals: WeeklyGoal[];
  studyPlans: StudyPlan[];
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setWeeklyGoal: (goal: Omit<WeeklyGoal, 'id'>) => void;
  addStudyPlan: (plan: Omit<StudyPlan, 'id'>) => void;
  updateStudyPlan: (id: string, plan: Partial<StudyPlan>) => void;
  deleteStudyPlan: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isConfigured, setIsConfigured] = useState(!!auth);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) {
      setMaterials([]);
      setTasks([]);
      setWeeklyGoals([]);
      setStudyPlans([]);
      return;
    }

    const uid = user.uid;

    const unsubMaterials = onSnapshot(collection(db, `users/${uid}/materials`), (snap) => {
      setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() } as Material)));
    });

    const unsubTasks = onSnapshot(collection(db, `users/${uid}/tasks`), (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
    });

    const unsubGoals = onSnapshot(collection(db, `users/${uid}/weeklyGoals`), (snap) => {
      setWeeklyGoals(snap.docs.map(d => ({ id: d.id, ...d.data() } as WeeklyGoal)));
    });

    const unsubPlans = onSnapshot(collection(db, `users/${uid}/studyPlans`), (snap) => {
      setStudyPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as StudyPlan)));
    });

    return () => {
      unsubMaterials();
      unsubTasks();
      unsubGoals();
      unsubPlans();
    };
  }, [user]);

  const addMaterial = async (material: Omit<Material, 'id'>) => {
    if (!user || !db) return;
    const id = crypto.randomUUID();
    await setDoc(doc(db, `users/${user.uid}/materials`, id), { ...material, id });
  };

  const updateMaterial = async (id: string, updates: Partial<Material>) => {
    if (!user || !db) return;
    await setDoc(doc(db, `users/${user.uid}/materials`, id), updates, { merge: true });
  };

  const deleteMaterial = async (id: string) => {
    if (!user || !db) return;
    await deleteDoc(doc(db, `users/${user.uid}/materials`, id));
    // Note: In a real production app, you might want a Cloud Function to clean up related tasks/goals
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    if (!user || !db) return;
    const id = crypto.randomUUID();
    await setDoc(doc(db, `users/${user.uid}/tasks`, id), { ...task, id });
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user || !db) return;
    await setDoc(doc(db, `users/${user.uid}/tasks`, id), updates, { merge: true });
  };

  const deleteTask = async (id: string) => {
    if (!user || !db) return;
    await deleteDoc(doc(db, `users/${user.uid}/tasks`, id));
  };

  const setWeeklyGoal = async (goalData: Omit<WeeklyGoal, 'id'>) => {
    if (!user || !db) return;
    // Find existing goal to update or create new
    const existing = weeklyGoals.find(g => g.materialId === goalData.materialId && g.weekStartDate === goalData.weekStartDate);
    const id = existing ? existing.id : crypto.randomUUID();
    await setDoc(doc(db, `users/${user.uid}/weeklyGoals`, id), { ...goalData, id });
  };

  const addStudyPlan = async (plan: Omit<StudyPlan, 'id'>) => {
    if (!user || !db) return;
    const id = crypto.randomUUID();
    await setDoc(doc(db, `users/${user.uid}/studyPlans`, id), { ...plan, id });
  };

  const updateStudyPlan = async (id: string, updates: Partial<StudyPlan>) => {
    if (!user || !db) return;
    await setDoc(doc(db, `users/${user.uid}/studyPlans`, id), updates, { merge: true });
  };

  const deleteStudyPlan = async (id: string) => {
    if (!user || !db) return;
    await deleteDoc(doc(db, `users/${user.uid}/studyPlans`, id));
  };

  return (
    <DataContext.Provider value={{
      user, isConfigured,
      materials, tasks, weeklyGoals, studyPlans,
      addMaterial, updateMaterial, deleteMaterial,
      addTask, updateTask, deleteTask, setWeeklyGoal,
      addStudyPlan, updateStudyPlan, deleteStudyPlan
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
