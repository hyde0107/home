export type MaterialStatus = 'in-progress' | 'stocked' | 'completed';

export type Material = {
  id: string;
  name: string;
  color: string;
  status: MaterialStatus;
};

export type TaskStatus = 'pending' | 'completed';

// Tasks are now strictly one-off deadlines
export type Task = {
  id: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  isPriority: boolean;
  status: TaskStatus;
};

export type WeeklyGoal = {
  id: string;
  materialId: string;
  weekStartDate: string; // YYYY-MM-DD (Monday of the week)
  goal: string;
};

// StudyPlan represents the manual allocation of a material on a specific day
export type StudyPlan = {
  id: string;
  materialId: string;
  date: string; // YYYY-MM-DD
  planText: string; // e.g., "p.1-10", "Chapter 1"
  isCompleted: boolean;
};

export type DiaryEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood?: string;
  createdAt: number;
};

