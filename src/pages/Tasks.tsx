import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '../lib/utils';

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask } = useData();
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isPriority, setIsPriority] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      deadline: newDeadline,
      isPriority,
      status: 'pending'
    });
    setNewTitle('');
    setIsPriority(false);
  };

  const today = startOfDay(new Date());

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    return a.deadline.localeCompare(b.deadline);
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">タスク管理</h1>
        <p className="text-slate-500 mt-1">単発の締め切りや予定（提出物、模試など）を管理します。</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-medium text-slate-900 mb-4">新規タスクの追加</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs text-slate-500 mb-1">タスク名</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="例: 英語の課題プリント提出"
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="w-full sm:w-40">
            <label className="block text-xs text-slate-500 mb-1">締め切り日</label>
            <input
              type="date"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>
          <div className="flex items-center h-10 px-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPriority}
                onChange={(e) => setIsPriority(e.target.checked)}
                className="rounded border-slate-300 text-rose-500 focus:ring-rose-500 w-4 h-4"
              />
              <span className="text-sm text-slate-700 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                重要
              </span>
            </label>
          </div>
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="h-10 px-4 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            追加
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <p className="text-sm text-slate-500 italic">登録されているタスクはありません。</p>
        ) : (
          <div className="grid gap-2">
            {sortedTasks.map(task => {
              const isDone = task.status === 'completed';
              const isOverdue = !isDone && isBefore(parseISO(task.deadline), today);
              
              return (
                <div 
                  key={task.id} 
                  className={cn(
                    "flex items-center justify-between p-3 bg-white border rounded-lg transition-colors",
                    isDone ? "border-slate-100 bg-slate-50 opacity-60" : "border-slate-200 hover:border-slate-300",
                    isOverdue && !isDone ? "border-rose-200 bg-rose-50/30" : ""
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button 
                      onClick={() => updateTask(task.id, { status: isDone ? 'pending' : 'completed' })}
                      className="flex-shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {task.isPriority && !isDone && <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                        <span className={cn(
                          "font-medium text-sm truncate",
                          isDone ? "text-slate-500 line-through" : "text-slate-900"
                        )}>
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          "text-xs",
                          isOverdue && !isDone ? "text-rose-600 font-medium" : "text-slate-500"
                        )}>
                          {format(parseISO(task.deadline), 'yyyy年M月d日 (E)', { locale: ja })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors flex-shrink-0"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
