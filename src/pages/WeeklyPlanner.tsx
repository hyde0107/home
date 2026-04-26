import React, { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, isBefore, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, AlertCircle, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Material, StudyPlan, Task } from '../types';
import { useData } from '../context/DataContext';

interface StudyPlanItemProps {
  plan: StudyPlan;
  material: Material;
  updateStudyPlan: (id: string, updates: Partial<StudyPlan>) => void;
  deleteStudyPlan: (id: string) => void;
}

const StudyPlanItem: React.FC<StudyPlanItemProps> = ({ plan, material, updateStudyPlan, deleteStudyPlan }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(plan.planText);
  const [editDate, setEditDate] = useState(plan.date);

  const handleUpdate = () => {
    if (!editText.trim() || !editDate) return;
    updateStudyPlan(plan.id, { 
      planText: editText.trim(),
      date: editDate 
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-2 bg-white border-2 border-slate-900 rounded-md shadow-md space-y-2 z-10 relative">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">内容</label>
          <input
            autoFocus
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleUpdate(); if (e.key === 'Escape') setIsEditing(false); }}
            className="w-full px-2 py-1 text-base md:text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">日付</label>
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="w-full px-2 py-1 text-base md:text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-500"
          />
        </div>
        <div className="flex justify-end gap-1">
          <button onClick={() => setIsEditing(false)} className="p-1 px-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">
            キャンセル
          </button>
          <button onClick={handleUpdate} className="p-1 px-2 text-[10px] font-bold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors flex items-center gap-1">
            <Plus className="w-3 h-3" /> 保存
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col p-2 bg-white border border-slate-200 rounded-md shadow-sm relative hover:border-slate-300 transition-all">
      <div className="flex items-center gap-1.5 mb-1">
        <div className={cn("w-2 h-2 rounded-full", material.color)} />
        <span className="text-[10px] font-medium text-slate-500 truncate">{material.name}</span>
      </div>
      <div className="flex items-center justify-between">
        <span 
          onClick={() => setIsEditing(true)}
          className={cn(
            "text-sm font-medium cursor-text flex-1",
            plan.isCompleted ? "line-through text-slate-400" : "text-slate-800"
          )}
        >
          {plan.planText}
        </span>
        <div className="flex items-center">
          <button 
            onClick={() => deleteStudyPlan(plan.id)}
            className="p-1 text-slate-400 hover:text-rose-500"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, updateTask, deleteTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleUpdate = () => {
    if (!editTitle.trim()) return;
    updateTask(task.id, { title: editTitle.trim() });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-2 bg-white border-2 border-slate-900 rounded-md shadow-md space-y-2">
        <input
          autoFocus
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setIsEditing(false); }}
          className="w-full px-2 py-1 text-base md:text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-500"
        />
        <div className="flex justify-end gap-1">
          <button onClick={() => setIsEditing(false)} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-3 h-3" />
          </button>
          <button onClick={handleUpdate} className="p-1 text-slate-900 hover:text-slate-700">
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2 p-2 bg-white border border-slate-200 rounded-md shadow-sm hover:border-slate-300 transition-all">
      {task.isPriority && <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />}
      <span 
        onClick={() => setIsEditing(true)}
        className={cn(
          "text-xs font-medium leading-tight cursor-text flex-1",
          task.status === 'completed' ? "line-through text-slate-400" : "text-slate-800"
        )}
      >
        {task.title}
      </span>
      <button 
        onClick={() => deleteTask(task.id)}
        className="p-1 text-slate-400 hover:text-rose-500 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

interface DayColumnProps {
  date: Date;
  tasks: Task[];
  studyPlans: StudyPlan[];
  materials: Material[];
  activeMaterials: Material[];
  addStudyPlan: (plan: Omit<StudyPlan, 'id'>) => void;
  updateStudyPlan: (id: string, updates: Partial<StudyPlan>) => void;
  deleteStudyPlan: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getSuggestedPlanText: (materialId: string, targetDateStr: string) => string;
}

const DayColumn: React.FC<DayColumnProps> = ({ 
  date, tasks, studyPlans, materials, activeMaterials, 
  addStudyPlan, updateStudyPlan, deleteStudyPlan, 
  addTask, updateTask, deleteTask, getSuggestedPlanText 
}) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const isToday = isSameDay(date, new Date());
  
  const dayTasks = tasks.filter(t => t.deadline === dateStr);
  const dayPlans = useMemo(() => {
    return studyPlans
      .filter(p => p.date === dateStr)
      .sort((a, b) => {
        const indexA = materials.findIndex(m => m.id === a.materialId);
        const indexB = materials.findIndex(m => m.id === b.materialId);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
  }, [studyPlans, dateStr, materials]);

  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(activeMaterials[0]?.id || 'none');
  const [planText, setPlanText] = useState('');

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleMaterialSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mId = e.target.value;
    setSelectedMaterialId(mId);
    setPlanText(getSuggestedPlanText(mId, dateStr));
  };

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planText.trim()) return;
    addStudyPlan({
      materialId: selectedMaterialId,
      date: dateStr,
      planText: planText.trim(),
      isCompleted: false
    });
    setPlanText('');
    setIsAddingPlan(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      deadline: dateStr,
      isPriority: false,
      status: 'pending'
    });
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  return (
    <div className={cn(
      "flex-1 flex flex-col border-r border-slate-100 min-w-[200px]",
      isToday ? "bg-slate-50/50" : "bg-white"
    )}>
      <div className={cn(
        "p-3 border-b border-slate-100 text-center",
        isToday ? "bg-slate-100" : "bg-slate-50"
      )}>
        <div className="text-xs font-medium text-slate-500">{format(date, 'E', { locale: ja })}</div>
        <div className={cn(
          "text-lg font-semibold mt-0.5",
          isToday ? "text-slate-900" : "text-slate-700"
        )}>
          {format(date, 'd')}
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-4">
        <div className="space-y-2">
          {dayTasks.map(task => (
            <TaskItem key={task.id} task={task} updateTask={updateTask} deleteTask={deleteTask} />
          ))}
          
          {isAddingTask ? (
            <form onSubmit={handleAddTask} className="flex items-center gap-1">
              <input
                autoFocus
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="タスク名..."
                className="flex-1 min-w-0 px-2 py-1 text-base md:text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-500"
              />
              <button type="button" onClick={() => setIsAddingTask(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <button 
              onClick={() => setIsAddingTask(true)}
              className="w-full py-1 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" /> タスク追加
            </button>
          )}
        </div>

        <div className="w-full h-px bg-slate-100" />

        <div className="space-y-2">
          {dayPlans.map(plan => {
            const material = materials.find(m => m.id === plan.materialId) || {
              id: 'none',
              name: '指定なし',
              color: 'bg-slate-300',
              status: 'in-progress'
            } as Material;
            
            return (
              <StudyPlanItem 
                key={plan.id} 
                plan={plan} 
                material={material} 
                updateStudyPlan={updateStudyPlan} 
                deleteStudyPlan={deleteStudyPlan} 
              />
            );
          })}

          {isAddingPlan ? (
            <form onSubmit={handleAddPlan} className="p-2 bg-slate-50 border border-slate-200 rounded-md space-y-2">
              <select
                value={selectedMaterialId}
                onChange={handleMaterialSelect}
                className="w-full px-2 py-1 text-base md:text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-500 bg-white"
              >
                <option value="none">指定なし (フリー学習)</option>
                {activeMaterials.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  type="text"
                  value={planText}
                  onChange={(e) => setPlanText(e.target.value)}
                  placeholder="例: p.1-10"
                  className="flex-1 min-w-0 px-2 py-1 text-base md:text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-500"
                />
                <button type="button" onClick={() => setIsAddingPlan(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <button 
                type="submit"
                disabled={!planText.trim()}
                className="w-full py-1 bg-slate-900 text-white text-base md:text-xs font-medium rounded hover:bg-slate-800 disabled:opacity-50"
              >
                追加
              </button>
            </form>
          ) : (
            <button 
              onClick={() => {
                setIsAddingPlan(true);
                if (selectedMaterialId && selectedMaterialId !== 'none') {
                  setPlanText(getSuggestedPlanText(selectedMaterialId, dateStr));
                } else {
                  setPlanText('');
                }
              }}
              className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-dashed border-slate-300 rounded transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" /> 学習予定
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function WeeklyPlanner() {
  const { materials, tasks, studyPlans, weeklyGoals, addStudyPlan, updateStudyPlan, deleteStudyPlan, addTask, updateTask, deleteTask } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const currentWeekGoals = useMemo(() => {
    return weeklyGoals
      .filter(g => g.weekStartDate === weekStartStr && g.goal.trim() !== '')
      .sort((a, b) => {
        const indexA = materials.findIndex(m => m.id === a.materialId);
        const indexB = materials.findIndex(m => m.id === b.materialId);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
  }, [weeklyGoals, weekStartStr, materials]);

  const prevWeek = () => setCurrentDate(addDays(weekStart, -7));
  const nextWeek = () => setCurrentDate(addDays(weekStart, 7));
  const today = startOfDay(new Date());

  const activeMaterials = materials.filter(m => m.status === 'in-progress');

  const overduePlans = useMemo(() => {
    return studyPlans.filter(p => {
      if (p.isCompleted) return false;
      const planDate = parseISO(p.date);
      return isBefore(planDate, today);
    }).sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      const indexA = materials.findIndex(m => m.id === a.materialId);
      const indexB = materials.findIndex(m => m.id === b.materialId);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  }, [studyPlans, today, materials]);

  // Smart Suggestion Logic has been removed as per user request to avoid auto-filling p.2~
  const getSuggestedPlanText = (materialId: string, targetDateStr: string) => {
    return '';
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/30">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between px-6 lg:px-10 py-5 bg-white border-b border-slate-200/60 flex-shrink-0">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Planner</h1>
          <p className="text-slate-400 mt-1 font-black text-[9px] uppercase tracking-[0.2em] opacity-40">Weekly Roadmap</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl self-start lg:self-auto border border-slate-100">
          <button onClick={prevWeek} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-slate-900">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-xs font-black w-56 text-center text-slate-600 tracking-tight">
            {format(weekStart, 'yyyy. MM. dd', { locale: ja })} - 
          </h2>
          <button onClick={nextWeek} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-slate-900">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto p-4 lg:p-6 min-h-0 flex flex-col">
        {/* Goals Section - Sleek pills */}
        {currentWeekGoals.length > 0 && (
          <section className="mb-5 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <h2 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Goals</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentWeekGoals.map(goal => {
                const material = materials.find(m => m.id === goal.materialId);
                if (!material) return null;
                return (
                  <div key={goal.id} className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-3 py-1.5 shadow-sm text-[11px] hover:border-indigo-100 transition-colors">
                    <div className={cn("w-1.5 h-1.5 rounded-full", material.color)} />
                    <span className="font-bold text-slate-700">{material.name}:</span>
                    <span className="text-slate-400 font-medium">{goal.goal}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Overdue - High visual priority but compact */}
        {overduePlans.length > 0 && (
          <section className="mb-6 animate-in fade-in slide-in-from-top-2 duration-500 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em]">Overdue</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {overduePlans.map(plan => {
                const material = materials.find(m => m.id === plan.materialId) || {
                  id: 'none',
                  name: 'Material',
                  color: 'bg-slate-200',
                  status: 'in-progress'
                } as Material;
                return (
                  <div key={plan.id} className="w-full md:w-[calc(33.333%-12px)] lg:w-[calc(25%-12px)] min-w-[240px]">
                    <div className="bg-white border border-rose-100 rounded-xl overflow-hidden shadow-sm hover:border-rose-200 transition-colors">
                      <StudyPlanItem 
                        plan={plan} 
                        material={material} 
                        updateStudyPlan={updateStudyPlan} 
                        deleteStudyPlan={deleteStudyPlan} 
                      />
                      <div className="pb-2 px-2.5 text-[9px] font-black text-rose-400 uppercase tracking-tight flex items-center gap-1 border-t border-rose-50 pt-2">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Missed: {format(parseISO(plan.date), 'M/d')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="flex-1 min-h-0 flex min-w-[1200px] gap-4 pb-4">
          {days.map(day => (
            <DayColumn 
              key={day.toISOString()} 
              date={day} 
              tasks={tasks}
              studyPlans={studyPlans}
              materials={materials}
              activeMaterials={activeMaterials}
              addStudyPlan={addStudyPlan}
              updateStudyPlan={updateStudyPlan}
              deleteStudyPlan={deleteStudyPlan}
              addTask={addTask}
              updateTask={updateTask}
              deleteTask={deleteTask}
              getSuggestedPlanText={getSuggestedPlanText}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
