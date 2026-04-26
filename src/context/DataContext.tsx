import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Material, Task, WeeklyGoal, StudyPlan, DiaryEntry } from '../types';
import { MATERIAL_COLORS } from '../constants';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

// ★ デバッグモード: true にするとログイン不要でローカルストレージを使って動作確認できます
const DEBUG_MODE = true;

interface DataContextType {
  user: User | null;
  isConfigured: boolean;
  isLoadingAuth: boolean;
  materials: Material[];
  tasks: Task[];
  weeklyGoals: WeeklyGoal[];
  studyPlans: StudyPlan[];
  diaryEntries: DiaryEntry[];
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
  saveDiaryEntry: (date: string, content: string, mood?: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEBUG_MODE ? { uid: 'debug-user', email: 'debug@example.com' } as User : null);
  const [isConfigured, setIsConfigured] = useState(DEBUG_MODE ? true : !!auth);
  const [isLoadingAuth, setIsLoadingAuth] = useState(!DEBUG_MODE);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    if (DEBUG_MODE) return;
    if (!auth) {
      setIsLoadingAuth(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (DEBUG_MODE) {
      const load = (key: string, setter: any) => {
        const data = localStorage.getItem(`debug_${key}`);
        if (data) setter(JSON.parse(data));
      };
      load('materials', setMaterials);
      load('tasks', setTasks);
      load('weeklyGoals', setWeeklyGoals);
      load('studyPlans', setStudyPlans);
      load('diaryEntries', setDiaryEntries);
      return;
    }

    if (!user || !db) {
      setMaterials([]);
      setTasks([]);
      setWeeklyGoals([]);
      setStudyPlans([]);
      setDiaryEntries([]);
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

    const unsubDiary = onSnapshot(collection(db, `users/${uid}/diaryEntries`), (snap) => {
      setDiaryEntries(snap.docs.map(d => ({ id: d.id, ...d.data() } as DiaryEntry)));
    });

    return () => {
      unsubMaterials();
      unsubTasks();
      unsubGoals();
      unsubPlans();
      unsubDiary();
    };
  }, [user]);

  const updateLocal = (key: string, setter: any, updater: (prev: any[]) => any[]) => {
    setter((prev: any[]) => {
      const next = updater(prev);
      localStorage.setItem(`debug_${key}`, JSON.stringify(next));
      return next;
    });
  };

  const addMaterial = async (material: Omit<Material, 'id'>) => {
    const id = crypto.randomUUID();
    const newMaterial = { ...material, id };
    if (DEBUG_MODE) {
      updateLocal('materials', setMaterials, prev => [...prev, newMaterial]);
      return;
    }
    if (!user || !db) return;
    await setDoc(doc(db, `users/${user.uid}/materials`, id), newMaterial);
  };

  const updateMaterial = async (id: string, updates: Partial<Material>) => {
    if (DEBUG_MODE) {
      updateLocal('materials', setMaterials, prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      return;
    }
    if (!user || !db) return;
    await setDoc(doc(db, `users/${user.uid}/materials`, id), updates, { merge: true });
  };

  const deleteMaterial = async (id: string) => {
    if (DEBUG_MODE) {
      updateLocal('materials', setMaterials, prev => prev.filter(m => m.id !== id));
      return;
    }
    if (!user || !db) return;
    await deleteDoc(doc(db, `users/${user.uid}/materials`, id));
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    const id = crypto.randomUUID();
    const newTask = { ...task, id };
    if (DEBUG_MODE) {
      updateLocal('tasks', setTasks, prev => [...prev, newTask]);
      return;
    }
    if (!user || !db) return;
    await setDoc(doc(db, `users/${user.uid}/tasks`, id), newTask);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (DEBUG_MODE) {
      updateLocal('tasks', setTasks, prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      return;
    }
    if (!user || !db) return;
    await setDoc(doc(db, `users/${user.uid}/tasks`, id), updates, { merge: true });
  };

  const deleteTask = async (id: string) => {
    if (DEBUG_MODE) {
      updateLocal('tasks', setTasks, prev => prev.filter(t => t.id !== id));
      return;
    }
    if (!user || !db) return;
    await deleteDoc(doc(db, `users/${user.uid}/tasks`, id));
  };

  const setWeeklyGoal = async (goalData: Omit<WeeklyGoal, 'id'>) => {
    if (DEBUG_MODE) {
      updateLocal('weeklyGoals', setWeeklyGoals, prev => {
        const existing = prev.find(g => g.materialId === goalData.materialId && g.weekStartDate === goalData.weekStartDate);
        if (existing) {
          return prev.map(g => g.id === existing.id ? { ...g, ...goalData } : g);
        }
        return [...prev, { ...goalData, id: crypto.randomUUID() }];
      });
      return;
    }
    if (!user || !db) return;
    const existing = weeklyGoals.find(g => g.materialId === goalData.materialId && g.weekStartDate === goalData.weekStartDate);
    const id = existing ? existing.id : crypto.randomUUID();
    await setDoc(doc(db, `users/${user.uid}/weeklyGoals`, id), { ...goalData, id });
  };

  const addStudyPlan = async (plan: Omit<StudyPlan, 'id'>) => {
    const id = crypto.randomUUID();
    const newPlan = { ...plan, id };
    if (DEBUG_MODE) {
      updateLocal('studyPlans', setStudyPlans, prev => [...prev, newPlan]);
      return;
    }
    if (!user || !db) return;
    await setDoc(doc(db, `users/${user.uid}/studyPlans`, id), newPlan);
  };

  const updateStudyPlan = async (id: string, updates: Partial<StudyPlan>) => {
    if (DEBUG_MODE) {
      updateLocal('studyPlans', setStudyPlans, prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      return;
    }
    if (!user || !db) return;
    await setDoc(doc(db, `users/${user.uid}/studyPlans`, id), updates, { merge: true });
  };

  const deleteStudyPlan = async (id: string) => {
    if (DEBUG_MODE) {
      updateLocal('studyPlans', setStudyPlans, prev => prev.filter(p => p.id !== id));
      return;
    }
    if (!user || !db) return;
    await deleteDoc(doc(db, `users/${user.uid}/studyPlans`, id));
  };

  const saveDiaryEntry = async (date: string, content: string, mood?: string) => {
    if (DEBUG_MODE) {
      updateLocal('diaryEntries', setDiaryEntries, prev => {
        const existing = prev.find(e => e.date === date);
        if (existing) {
          return prev.map(e => e.id === existing.id ? { ...e, content, mood } : e);
        }
        return [...prev, { id: crypto.randomUUID(), date, content, mood, createdAt: Date.now() }];
      });
      return;
    }
    if (!user || !db) return;
    const existing = diaryEntries.find(e => e.date === date);
    const id = existing ? existing.id : crypto.randomUUID();
    await setDoc(doc(db, `users/${user.uid}/diaryEntries`, id), {
      id,
      date,
      content,
      mood,
      createdAt: existing ? existing.createdAt : Date.now()
    });
  };

  const sortedMaterials = useMemo(() => {
    return [...materials].sort((a, b) => {
      const indexA = MATERIAL_COLORS.indexOf(a.color);
      const indexB = MATERIAL_COLORS.indexOf(b.color);
      
      // If color is not found in the array (e.g., custom or changed), put it at the end
      if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });
  }, [materials]);

  return (
    <DataContext.Provider value={{
      user, isConfigured, isLoadingAuth,
      materials: sortedMaterials, tasks, weeklyGoals, studyPlans, diaryEntries,
      addMaterial, updateMaterial, deleteMaterial,
      addTask, updateTask, deleteTask, setWeeklyGoal,
      addStudyPlan, updateStudyPlan, deleteStudyPlan,
      saveDiaryEntry
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
