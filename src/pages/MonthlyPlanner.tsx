import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  startOfMonth, endOfMonth, eachWeekOfInterval, 
  format, addDays, parseISO, isWithinInterval
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

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

  const MatrixCell = ({ materialId, weekStart }: { materialId: string, weekStart: Date }) => {
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
        className="h-24 border-b border-r border-slate-100 p-2 hover:bg-slate-50 transition-colors relative group"
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {isEditing ? (
          <textarea
            autoFocus
            value={tempGoal}
            onChange={(e) => setTempGoal(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
            className="w-full h-full text-xs text-slate-700 bg-white border border-slate-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-slate-500 resize-none"
            placeholder="目標..."
          />
        ) : (
          <div className="w-full h-full text-xs text-slate-700 line-clamp-4 whitespace-pre-wrap cursor-text">
            {goal?.goal || <span className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">目標を設定...</span>}
          </div>
        )}
      </div>
    );
  };

  const TaskCell = ({ weekStart }: { weekStart: Date }) => {
    const weekEnd = addDays(weekStart, 6);
    const weekTasks = tasks.filter(t => {
      const taskDate = parseISO(t.deadline);
      return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
    });

    return (
      <div className="h-24 border-b border-r border-slate-100 p-2 bg-slate-50/50 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {weekTasks.map(task => (
            <div key={task.id} className="flex items-start gap-1 text-[10px] bg-white border border-slate-200 rounded px-1.5 py-1 shadow-sm">
              {task.isPriority && <AlertCircle className="w-3 h-3 text-rose-500 flex-shrink-0 mt-0.5" />}
              <span className={cn("truncate", task.status === 'completed' && "line-through text-slate-400")}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <header className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">月間ロードマップ</h1>
          <p className="text-slate-500 mt-1">タスクの締め切りを俯瞰し、教材の週間目標を設定します。</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-lg font-medium w-32 text-center">
            {format(currentDate, 'yyyy年 M月', { locale: ja })}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="min-w-[800px] border-t border-l border-slate-100 rounded-tl-lg">
          {/* Header Row */}
          <div className="flex">
            <div className="w-48 flex-shrink-0 border-b border-r border-slate-100 bg-slate-50 p-3 flex items-end">
              <span className="text-xs font-medium text-slate-500">教材 / 週</span>
            </div>
            {weeks.map((week, i) => (
              <div key={i} className="flex-1 border-b border-r border-slate-100 bg-slate-50 p-3 text-center">
                <span className="text-xs font-medium text-slate-700">{getWeekLabel(week)}</span>
              </div>
            ))}
          </div>

          {/* Tasks Row (Deadlines) */}
          <div className="flex">
            <div className="w-48 flex-shrink-0 border-b border-r border-slate-100 p-3 flex items-center gap-2 bg-slate-50">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">締め切り / 予定</span>
            </div>
            {weeks.map((week, i) => (
              <div key={i} className="flex-1">
                <TaskCell weekStart={week} />
              </div>
            ))}
          </div>

          {/* Material Rows */}
          {activeMaterials.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 border-b border-r border-slate-100">
              進行中の教材がありません。「教材管理」から追加してください。
            </div>
          ) : (
            activeMaterials.map(material => (
              <div key={material.id} className="flex">
                <div className="w-48 flex-shrink-0 border-b border-r border-slate-100 p-3 flex items-center gap-2 bg-white">
                  <div className={cn("w-2 h-2 rounded-full", material.color)} />
                  <span className="text-sm font-medium text-slate-900 truncate" title={material.name}>
                    {material.name}
                  </span>
                </div>
                {weeks.map((week, i) => (
                  <div key={i} className="flex-1">
                    <MatrixCell materialId={material.id} weekStart={week} />
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
