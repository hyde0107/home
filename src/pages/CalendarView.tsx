import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday 
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Material } from '../types';

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
    <div className="h-full flex flex-col bg-slate-50/30">
      <header className="flex flex-col md:flex-row md:items-center justify-between px-6 lg:px-10 py-8 bg-white border-b border-slate-200">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">カレンダー</h1>
          <p className="text-slate-500 mt-2 font-medium">月間のタスクと学習予定をカレンダー形式で確認します。</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-2xl">
          <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-base font-bold w-40 text-center text-slate-900">
            {format(currentDate, 'yyyy年 M月', { locale: ja })}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 lg:p-10">
        <div className="min-w-[900px] bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
            {weekDays.map((day, i) => (
              <div key={i} className="py-3 text-center border-r border-slate-200 last:border-r-0">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  i === 5 ? "text-blue-500" : i === 6 ? "text-rose-500" : "text-slate-400"
                )}>
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-[minmax(140px,auto)]">
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
                    "border-r border-b border-slate-100 p-3 flex flex-col gap-2 transition-colors last:border-r-0",
                    isCurrentMonth ? "bg-white" : "bg-slate-50/30",
                    isTodayDate && "bg-blue-50/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-xs font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                      isTodayDate 
                        ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                        : !isCurrentMonth ? "text-slate-300" : "text-slate-500"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {/* Tasks */}
                    {dayTasks.map(task => (
                      <div 
                        key={task.id}
                        onClick={(e) => toggleTaskStatus(e, task.id, task.status)}
                        className={cn(
                          "text-[10px] px-2 py-1.5 rounded-lg border cursor-pointer flex items-start gap-1.5 transition-all duration-200",
                          task.status === 'completed' 
                            ? "bg-slate-50 border-slate-100 text-slate-400 line-through" 
                            : task.isPriority 
                              ? "bg-rose-50 border-rose-100 text-rose-700 hover:shadow-sm hover:-translate-y-0.5" 
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5"
                        )}
                      >
                        {task.isPriority && task.status !== 'completed' && (
                          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="font-bold truncate leading-tight">{task.title}</span>
                      </div>
                    ))}

                    {/* Study Plans */}
                    {dayPlans.map(plan => {
                      const material = materials.find(m => m.id === plan.materialId) || {
                        id: 'none',
                        name: '指定なし',
                        color: 'bg-slate-300',
                        status: 'in-progress'
                      } as Material;

                      return (
                        <div 
                          key={plan.id}
                          onClick={(e) => togglePlanStatus(e, plan.id, plan.isCompleted)}
                          className={cn(
                            "text-[10px] px-2 py-1.5 rounded-lg border cursor-pointer flex items-center gap-2 transition-all duration-200",
                            plan.isCompleted 
                              ? "bg-slate-50 border-slate-100 text-slate-400 line-through" 
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5"
                          )}
                        >
                          <div className={cn("w-2 h-2 rounded-full flex-shrink-0 shadow-sm", material.color, plan.isCompleted && "opacity-40")} />
                          <span className="font-bold truncate leading-tight">{plan.planText}</span>
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
