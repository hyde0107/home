import React from 'react';
import { useData } from '../context/DataContext';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Task, StudyPlan } from '../types';

export default function Dashboard() {
  const { tasks, materials, studyPlans, updateTask, updateStudyPlan } = useData();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Filter tasks
  const todayTasks = tasks.filter(t => t.deadline === todayStr);
  
  const urgentTasks = tasks.filter(t => {
    if (t.status === 'completed') return false;
    const deadlineDate = parseISO(t.deadline);
    return isBefore(deadlineDate, startOfDay(today));
  });

  // Filter study plans
  const todayPlans = studyPlans.filter(p => p.date === todayStr);

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask(task.id, { status: newStatus });
  };

  const togglePlanStatus = (plan: StudyPlan) => {
    updateStudyPlan(plan.id, { isCompleted: !plan.isCompleted });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">今日のタスク</h1>
        <p className="text-slate-500 mt-1">{format(today, 'yyyy年 M月 d日 (E)', { locale: ja })}</p>
      </header>

      <div className="space-y-8">
        {/* Urgent Tasks */}
        {urgentTasks.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-rose-600 flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4" />
              期限切れのタスク
            </h2>
            <div className="space-y-2">
              {urgentTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-rose-200 bg-rose-50/30">
                  <button onClick={() => toggleTaskStatus(task)} className="flex-shrink-0">
                    <Circle className="w-5 h-5 text-rose-300 hover:text-rose-400" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-rose-600 mt-0.5">
                      {format(parseISO(task.deadline), 'M/d')} 締め切り
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Today's Tasks (Deadlines) */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            今日の締め切り / 予定
          </h2>
          {todayTasks.length > 0 ? (
            <div className="space-y-2">
              {todayTasks.map(task => {
                const isDone = task.status === 'completed';
                return (
                  <div key={task.id} className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    isDone ? "border-slate-100 bg-slate-50 opacity-60" : "border-slate-200 bg-white hover:border-slate-300"
                  )}>
                    <button onClick={() => toggleTaskStatus(task)} className="flex-shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      {task.isPriority && !isDone && <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isDone ? "text-slate-500 line-through" : "text-slate-900"
                      )}>
                        {task.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">今日の締め切り・予定はありません。</p>
          )}
        </section>

        {/* Today's Study Plans */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-4">今日の学習予定</h2>
          {todayPlans.length > 0 ? (
            <div className="space-y-2">
              {todayPlans.map(plan => {
                const material = materials.find(m => m.id === plan.materialId);
                if (!material) return null;
                const isDone = plan.isCompleted;

                return (
                  <div key={plan.id} className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    isDone ? "border-slate-100 bg-slate-50 opacity-60" : "border-slate-200 bg-white hover:border-slate-300"
                  )}>
                    <button onClick={() => togglePlanStatus(plan)} className="flex-shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isDone ? "text-slate-500 line-through" : "text-slate-900"
                      )}>
                        {plan.planText}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={cn("w-2 h-2 rounded-full", material.color)} />
                        <span className="text-xs text-slate-500">{material.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">予定されている学習はありません。</p>
          )}
        </section>
      </div>
    </div>
  );
}
