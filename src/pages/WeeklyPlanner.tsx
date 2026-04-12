import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  startOfWeek, addDays, format, parseISO, isSameDay
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, AlertCircle, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Material, StudyPlan } from '../types';

export default function WeeklyPlanner() {
  const { materials, tasks, studyPlans, addStudyPlan, updateStudyPlan, deleteStudyPlan, addTask } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const prevWeek = () => setCurrentDate(addDays(weekStart, -7));
  const nextWeek = () => setCurrentDate(addDays(weekStart, 7));

  const activeMaterials = materials.filter(m => m.status === 'in-progress');

  // Smart Suggestion Logic
  const getSuggestedPlanText = (materialId: string, targetDateStr: string) => {
    // Find the most recent study plan for this material before the target date
    const previousPlans = studyPlans
      .filter(p => p.materialId === materialId && p.date < targetDateStr)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (previousPlans.length === 0) return '';

    const lastPlanText = previousPlans[0].planText;
    // Try to extract the last number from the text (e.g., "p.1-50" -> 50)
    const match = lastPlanText.match(/\d+(?!.*\d)/);
    if (match) {
      const lastNum = parseInt(match[0], 10);
      return `p.${lastNum + 1}-`;
    }
    return '';
  };

  const DayColumn: React.FC<{ date: Date }> = ({ date }) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isToday = isSameDay(date, new Date());
    
    // Tasks for this day
    const dayTasks = tasks.filter(t => t.deadline === dateStr);
    
    // Study Plans for this day
    const dayPlans = studyPlans.filter(p => p.date === dateStr);

    const [isAddingPlan, setIsAddingPlan] = useState(false);
    const [selectedMaterialId, setSelectedMaterialId] = useState(activeMaterials[0]?.id || '');
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
      if (!planText.trim() || !selectedMaterialId) return;
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
        {/* Day Header */}
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
          {/* Tasks Section */}
          <div className="space-y-2">
            {dayTasks.map(task => (
              <div key={task.id} className="flex items-start gap-2 p-2 bg-white border border-slate-200 rounded-md shadow-sm">
                {task.isPriority && <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />}
                <span className={cn(
                  "text-xs font-medium leading-tight",
                  task.status === 'completed' ? "line-through text-slate-400" : "text-slate-800"
                )}>
                  {task.title}
                </span>
              </div>
            ))}
            
            {isAddingTask ? (
              <form onSubmit={handleAddTask} className="flex items-center gap-1">
                <input
                  autoFocus
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="タスク名..."
                  className="flex-1 min-w-0 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-500"
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

          {/* Study Plans Section */}
          <div className="space-y-2">
            {dayPlans.map(plan => {
              const material = materials.find(m => m.id === plan.materialId);
              if (!material) return null;
              
              return (
                <div key={plan.id} className="group flex flex-col p-2 bg-white border border-slate-200 rounded-md shadow-sm relative">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={cn("w-2 h-2 rounded-full", material.color)} />
                    <span className="text-[10px] font-medium text-slate-500 truncate">{material.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-sm font-medium",
                      plan.isCompleted ? "line-through text-slate-400" : "text-slate-800"
                    )}>
                      {plan.planText}
                    </span>
                    <button 
                      onClick={() => deleteStudyPlan(plan.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {isAddingPlan ? (
              <form onSubmit={handleAddPlan} className="p-2 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                <select
                  value={selectedMaterialId}
                  onChange={handleMaterialSelect}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-500 bg-white"
                >
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
                    className="flex-1 min-w-0 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-500"
                  />
                  <button type="button" onClick={() => setIsAddingPlan(false)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <button 
                  type="submit"
                  disabled={!planText.trim()}
                  className="w-full py-1 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-800 disabled:opacity-50"
                >
                  追加
                </button>
              </form>
            ) : (
              <button 
                onClick={() => {
                  setIsAddingPlan(true);
                  if (selectedMaterialId) {
                    setPlanText(getSuggestedPlanText(selectedMaterialId, dateStr));
                  }
                }}
                disabled={activeMaterials.length === 0}
                className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-dashed border-slate-300 rounded transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3 h-3" /> 学習予定
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <header className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">週間プランナー</h1>
          <p className="text-slate-500 mt-1">日々の学習量を柔軟に割り当てます。</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={prevWeek} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-lg font-medium w-48 text-center">
            {format(weekStart, 'yyyy年 M月 d日', { locale: ja })} - 
          </h2>
          <button onClick={nextWeek} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto">
        <div className="flex h-full min-w-[1000px]">
          {days.map(day => (
            <DayColumn key={day.toISOString()} date={day} />
          ))}
        </div>
      </div>
    </div>
  );
}
