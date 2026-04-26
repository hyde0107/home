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
      className="min-h-[4rem] border-b border-r border-slate-100 p-2 hover:bg-slate-50 transition-colors relative group"
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {isEditing ? (
        <textarea
          autoFocus
          value={tempGoal}
          onChange={(e) => setTempGoal(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
          className="w-full h-full min-h-[4rem] text-sm md:text-base text-slate-700 bg-white border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-slate-500 resize-none font-medium"
          placeholder="目標..."
        />
      ) : (
        <div className="w-full h-full text-xs md:text-sm text-slate-700 break-words whitespace-normal cursor-text font-medium leading-relaxed">
          {goal?.goal || <span className="text-slate-300">目標を設定...</span>}
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
      <div className="flex flex-col gap-1.5">
        {weekTasks.map(task => (
          <div key={task.id} className="flex items-start gap-1.5 text-[10px] md:text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
            {task.isPriority && <AlertCircle className="w-3 h-3 text-rose-500 flex-shrink-0 mt-0.5" />}
            <span className={cn("break-words whitespace-normal font-bold", task.status === 'completed' && "line-through text-slate-400")}>
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
      <header className="flex flex-col md:flex-row md:items-center justify-between px-6 lg:px-10 py-8 bg-white border-b border-slate-200">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">月間ロードマップ</h1>
          <p className="text-slate-500 mt-2 font-medium">タスクの締め切りを俯瞰し、教材の週間目標を設定します。</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-2xl">
          <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-base font-bold w-32 text-center text-slate-900">
            {format(currentDate, 'yyyy年 M月', { locale: ja })}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 lg:p-10">
        <div className="mb-4 lg:hidden flex items-center gap-2 text-slate-400">
          <Zap className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">横にスクロールして確認できます</span>
        </div>
        <div className="min-w-[800px] bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200">
            <div className="w-64 flex-shrink-0 bg-slate-50/50 p-4 flex items-end border-r border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">教材 / 週</span>
            </div>
            {weeks.map((week, i) => (
              <div key={i} className="flex-1 bg-slate-50/50 p-4 text-center border-r border-slate-200 last:border-r-0">
                <span className="text-sm font-bold text-slate-600 tracking-tight">{getWeekLabel(week)}</span>
              </div>
            ))}
          </div>

          <div className="flex border-b border-slate-200">
            <div className="w-64 flex-shrink-0 p-4 flex items-center gap-2 bg-slate-50/30 border-r border-slate-200">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">締め切り / 予定</span>
            </div>
            {weeks.map((week, i) => (
              <div key={i} className="flex-1 border-r border-slate-200 last:border-r-0">
                <TaskCell weekStart={week} tasks={tasks} />
              </div>
            ))}
          </div>

          {displayMaterials.map(material => (
            <div key={material.id} className="flex border-b border-slate-100 last:border-b-0 group">
              <div className="w-64 flex-shrink-0 p-4 flex items-center gap-3 bg-white border-r border-slate-200 group-hover:bg-slate-50 transition-colors">
                <div className={cn("w-3.5 h-3.5 rounded-full shadow-sm", material.color)} />
                <span className="text-base font-bold text-slate-700 truncate" title={material.name}>
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
