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
      <header className="flex flex-col lg:flex-row lg:items-center justify-between px-6 lg:px-10 py-5 bg-white border-b border-slate-200/60 flex-shrink-0">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Calendar</h1>
          <p className="text-slate-400 mt-1 font-black text-[9px] uppercase tracking-[0.2em] opacity-40">Monthly view</p>
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

      <div className="flex-1 overflow-auto p-4 lg:p-10">
        <div className="min-w-[900px] bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200/60 bg-slate-50/50">
            {weekDays.map((day, i) => (
              <div key={i} className="py-2.5 text-center border-r border-slate-200/60 last:border-r-0">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
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
              const dayPlans = studyPlans.filter(p => p.date === dateStr).sort((a, b) => {
                const indexA = materials.findIndex(m => m.id === a.materialId);
                const indexB = materials.findIndex(m => m.id === b.materialId);
                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
              });

              return (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    "border-r border-b border-slate-100 p-2 lg:p-3 flex flex-col gap-2 transition-colors last:border-r-0",
                    isCurrentMonth ? "bg-white" : "bg-slate-50/30",
                    isTodayDate && "bg-slate-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={cn(
                      "text-[10px] lg:text-xs font-black w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center rounded-lg transition-all",
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
                          "text-[9px] px-1.5 py-1 rounded-md border cursor-pointer flex items-start gap-1 transition-all duration-200",
                          task.status === 'completed' 
                            ? "bg-transparent border-transparent opacity-50 line-through text-slate-400" 
                            : task.isPriority 
                              ? "bg-rose-50 border-rose-100 text-rose-700 hover:border-rose-200" 
                              : "bg-white border-slate-200/60 text-slate-700 hover:border-slate-300 hover:shadow-sm"
                        )}
                      >
                        {task.isPriority && task.status !== 'completed' && (
                          <AlertCircle className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="font-black uppercase tracking-wide truncate leading-tight">{task.title}</span>
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
                            "text-[9px] px-1.5 py-1 rounded-md border cursor-pointer flex flex-col items-start gap-0.5 transition-all duration-200",
                            plan.isCompleted 
                              ? "bg-transparent border-transparent opacity-50 line-through text-slate-400" 
                              : "bg-white border-slate-200/60 text-slate-700 hover:border-slate-300 hover:shadow-sm"
                          )}
                        >
                          <div className="flex items-center gap-1 w-full">
                            <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", material.color, plan.isCompleted && "opacity-40")} />
                            <span className={cn("font-black tracking-widest uppercase text-[7px] truncate", plan.isCompleted ? "text-slate-400" : "text-slate-400")}>
                              {material.name}
                            </span>
                          </div>
                          <span className={cn("font-black uppercase tracking-wide truncate leading-tight w-full pl-2.5", plan.isCompleted && "line-through text-slate-400")}>
                            {plan.planText}
                          </span>
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
