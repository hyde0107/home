import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  startOfMonth, endOfMonth, eachWeekOfInterval, 
  format, addDays, parseISO, isWithinInterval
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, AlertCircle, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { Material, WeeklyGoal, Task } from '../types';

interface MatrixCellProps {
  materialId: string;
  weekStart: Date;
  weeklyGoals: WeeklyGoal[];
  setWeeklyGoal: (goal: Omit<WeeklyGoal, 'id'>) => void;
}

const MatrixCell: React.FC<MatrixCellProps> = ({ materialId, weekStart, weeklyGoals, setWeeklyGoal }) => {
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const goal = weeklyGoals.find(g => g.materialId === materialId && g.weekStartDate === weekStartStr);
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal?.goal || '');

  const handleSave = () => {
    setIsEditing(false);
    if (tempGoal !== goal?.goal) {
      setWeeklyGoal({ materialId, weekStartDate: weekStartStr, goal: tempGoal });
    }
  };

  return (
    <div 
      className="min-h-[4rem] border-b border-r border-slate-100 p-2.5 hover:bg-slate-50 transition-colors relative group"
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {isEditing ? (
        <textarea
          autoFocus
          value={tempGoal}
          onChange={(e) => setTempGoal(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
          className="w-full h-full min-h-[4rem] text-[10px] uppercase font-black tracking-wide text-slate-700 bg-white border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-slate-500 resize-none"
          placeholder="Goal..."
        />
      ) : (
        <div className="w-full h-full text-[10px] text-slate-600 break-words whitespace-normal cursor-text font-black uppercase tracking-wide leading-relaxed">
          {goal?.goal || <span className="text-slate-300">Add Goal...</span>}
        </div>
      )}
    </div>
  );
};

interface TaskCellProps {
  weekStart: Date;
  tasks: Task[];
}

const TaskCell: React.FC<TaskCellProps> = ({ weekStart, tasks }) => {
  const weekEnd = addDays(weekStart, 6);
  const weekTasks = tasks.filter(t => {
    const taskDate = parseISO(t.deadline);
    return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
  });

  return (
    <div className="min-h-[4.5rem] border-b border-r border-slate-100 p-2.5 bg-slate-50/50 overflow-y-auto">
      <div className="flex flex-col gap-0">
        {weekTasks.map(task => (
          <div key={task.id} className="flex items-start gap-1.5 pb-1.5 mb-1.5 border-b border-slate-200/50 last:border-b-0 last:mb-0 last:pb-0">
            {task.isPriority && <AlertCircle className="w-2.5 h-2.5 text-rose-500 flex-shrink-0 mt-0.5" />}
            <span className={cn("text-[8px] uppercase tracking-wide font-black break-words whitespace-normal", task.status === 'completed' && "line-through text-slate-300", !task.status && "text-slate-600")}>
              {task.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function MonthlyPlanner() {
  const { materials, tasks, weeklyGoals, setWeeklyGoal } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });

  const prevMonth = () => setCurrentDate(addDays(monthStart, -1));
  const nextMonth = () => setCurrentDate(addDays(monthEnd, 1));

  const getWeekLabel = (weekStart: Date) => {
    const weekEnd = addDays(weekStart, 6);
    return `${format(weekStart, 'M/d')} - ${format(weekEnd, 'M/d')}`;
  };

  const activeMaterials = materials.filter(m => m.status === 'in-progress');
  
  const displayMaterials = [
    ...activeMaterials,
    {
      id: 'none',
      name: '指定なし (自由学習)',
      color: 'bg-slate-300',
      status: 'in-progress'
    } as Material
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50/30">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between px-6 lg:px-10 py-5 bg-white border-b border-slate-200/60 flex-shrink-0">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Roadmap</h1>
          <p className="text-slate-400 mt-1 font-black text-[9px] uppercase tracking-[0.2em] opacity-40">Monthly Overview</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl self-start lg:self-auto border border-slate-100">
          <button onClick={prevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-slate-900">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-xs font-black w-32 text-center text-slate-600 tracking-tight">
            {format(currentDate, 'yyyy. MM')}
          </h2>
          <button onClick={nextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-slate-900">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mb-4 lg:hidden flex items-center gap-2 text-slate-300">
          <Zap className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase tracking-widest leading-none">Scroll to roadmap</span>
        </div>
        <div className="min-w-[800px] bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="flex border-b border-slate-200/60">
            <div className="w-56 flex-shrink-0 bg-slate-50/30 p-3.5 flex items-end border-r border-slate-100">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">Resource / Week</span>
            </div>
            {weeks.map((week, i) => (
              <div key={i} className="flex-1 bg-slate-50/30 p-3.5 text-center border-r border-slate-100 last:border-r-0">
                <span className="text-[11px] font-black text-slate-500 tracking-tight">{getWeekLabel(week)}</span>
              </div>
            ))}
          </div>

          <div className="flex border-b border-slate-200/60">
            <div className="w-56 flex-shrink-0 p-3.5 flex items-center gap-2 bg-slate-50/10 border-r border-slate-100">
              <AlertCircle className="w-3.5 h-3.5 text-slate-200" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Milestones</span>
            </div>
            {weeks.map((week, i) => (
              <div key={i} className="flex-1 border-r border-slate-100 last:border-r-0">
                <TaskCell weekStart={week} tasks={tasks} />
              </div>
            ))}
          </div>

          {displayMaterials.map(material => (
            <div key={material.id} className="flex border-b border-slate-50 last:border-b-0 group">
              <div className="w-56 flex-shrink-0 p-3.5 flex items-center gap-2.5 bg-white border-r border-slate-100 group-hover:bg-slate-50 transition-colors">
                <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", material.color)} />
                <span className="text-[13px] font-bold text-slate-700 truncate tracking-tight" title={material.name}>
                  {material.name}
                </span>
              </div>
              {weeks.map((week, i) => (
                <div key={i} className="flex-1 border-r border-slate-100 last:border-r-0">
                  <MatrixCell 
                    materialId={material.id} 
                    weekStart={week} 
                    weeklyGoals={weeklyGoals} 
                    setWeeklyGoal={setWeeklyGoal} 
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
