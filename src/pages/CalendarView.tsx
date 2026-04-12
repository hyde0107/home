import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday 
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function CalendarView() {
  const { tasks, studyPlans, materials, updateTask, updateStudyPlan } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['月', '火', '水', '木', '金', '土', '日'];

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const toggleTaskStatus = (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation();
    updateTask(id, { status: currentStatus === 'completed' ? 'pending' : 'completed' });
  };

  const togglePlanStatus = (e: React.MouseEvent, id: string, isCompleted: boolean) => {
    e.stopPropagation();
    updateStudyPlan(id, { isCompleted: !isCompleted });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <header className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">カレンダー</h1>
          <p className="text-slate-500 mt-1">月間のタスクと学習予定をカレンダー形式で確認します。</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-lg font-medium w-40 text-center">
            {format(currentDate, 'yyyy年 M月', { locale: ja })}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="min-w-[800px] border-t border-l border-slate-100 rounded-tl-lg bg-slate-50">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {weekDays.map((day, i) => (
              <div key={i} className="py-2 text-center border-r border-slate-100">
                <span className={cn(
                  "text-xs font-medium",
                  i === 5 ? "text-blue-500" : i === 6 ? "text-rose-500" : "text-slate-500"
                )}>
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)]">
            {days.map((day, i) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isTodayDate = isToday(day);
              
              const dayTasks = tasks.filter(t => t.deadline === dateStr);
              const dayPlans = studyPlans.filter(p => p.date === dateStr);

              return (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    "border-r border-b border-slate-100 p-2 flex flex-col gap-1 transition-colors",
                    isCurrentMonth ? "bg-white" : "bg-slate-50/50",
                    isTodayDate && "bg-blue-50/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                      isTodayDate ? "bg-blue-600 text-white" : 
                      !isCurrentMonth ? "text-slate-400" : "text-slate-700"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {/* Tasks */}
                    {dayTasks.map(task => (
                      <div 
                        key={task.id}
                        onClick={(e) => toggleTaskStatus(e, task.id, task.status)}
                        className={cn(
                          "text-[10px] px-1.5 py-1 rounded border cursor-pointer flex items-start gap-1 transition-colors",
                          task.status === 'completed' 
                            ? "bg-slate-50 border-slate-200 text-slate-400 line-through" 
                            : task.isPriority 
                              ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100" 
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        {task.isPriority && task.status !== 'completed' && (
                          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="truncate leading-tight">{task.title}</span>
                      </div>
                    ))}

                    {/* Study Plans */}
                    {dayPlans.map(plan => {
                      const material = materials.find(m => m.id === plan.materialId);
                      if (!material) return null;

                      return (
                        <div 
                          key={plan.id}
                          onClick={(e) => togglePlanStatus(e, plan.id, plan.isCompleted)}
                          className={cn(
                            "text-[10px] px-1.5 py-1 rounded border cursor-pointer flex items-center gap-1.5 transition-colors",
                            plan.isCompleted 
                              ? "bg-slate-50 border-slate-200 text-slate-400 line-through" 
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", material.color, plan.isCompleted && "opacity-40")} />
                          <span className="truncate leading-tight">{plan.planText}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
