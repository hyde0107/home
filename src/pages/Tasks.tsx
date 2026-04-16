import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle, Edit2, X, Save } from 'lucide-react';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { Task, Material } from '../types';

export default function Tasks() {
  const { tasks, studyPlans, materials, addTask, updateTask, deleteTask, updateStudyPlan, deleteStudyPlan } = useData();
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isPriority, setIsPriority] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editPriority, setEditPriority] = useState(false);

  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanText, setEditPlanText] = useState('');

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

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDeadline(task.deadline);
    setEditPriority(task.isPriority);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id: string) => {
    if (!editTitle.trim()) return;
    await updateTask(id, {
      title: editTitle.trim(),
      deadline: editDeadline,
      isPriority: editPriority
    });
    setEditingId(null);
  };

  const today = startOfDay(new Date());

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    return a.deadline.localeCompare(b.deadline);
  });

  const overdueTasks = tasks.filter(t => t.status === 'pending' && isBefore(parseISO(t.deadline), today));
  const overduePlans = studyPlans.filter(p => !p.isCompleted && isBefore(parseISO(p.date), today));
  
  const filteredTasks = sortedTasks.filter(t => {
    const isOverdue = overdueTasks.find(ot => ot.id === t.id);
    if (isOverdue) return false;
    if (!showCompleted && t.status === 'completed') return false;
    return true;
  });

  const handleUpdatePlan = async (id: string) => {
    if (!editPlanText.trim()) return;
    await updateStudyPlan(id, { planText: editPlanText.trim() });
    setEditingPlanId(null);
  };

  const renderStudyPlanItem = (plan: any) => {
    const material = materials.find(m => m.id === plan.materialId) || {
      id: 'none',
      name: '指定なし',
      color: 'bg-slate-300',
      status: 'in-progress'
    } as Material;
    const isEditing = editingPlanId === plan.id;

    if (isEditing) {
      return (
        <div key={plan.id} className="p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-lg animate-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">予定の内容</label>
              <input
                autoFocus
                type="text"
                value={editPlanText}
                onChange={(e) => setEditPlanText(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => setEditingPlanId(null)} className="flex-1 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors">
                キャンセル
              </button>
              <button onClick={() => handleUpdatePlan(plan.id)} className="flex-[2] py-2.5 bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 rounded-xl transition-colors shadow-md">
                保存する
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={plan.id} className="flex items-center justify-between p-4 bg-white border border-rose-200 bg-rose-50/30 rounded-2xl transition-all duration-200 group">
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={() => updateStudyPlan(plan.id, { isCompleted: true })}
            className="flex-shrink-0"
          >
            <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400 transition-colors" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", material.color)} />
              <span className="font-bold text-sm lg:text-base truncate text-slate-900">
                {plan.planText}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-tight">
                予定日: {format(parseISO(plan.date), 'yyyy年M月d日 (E)', { locale: ja })}
              </span>
              <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold uppercase">期限切れ</span>
              <span className="text-[10px] text-slate-400 font-bold">({material.name})</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setEditingPlanId(plan.id);
              setEditPlanText(plan.planText);
            }}
            className="p-2.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            title="編集"
          >
            <Edit2 className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => deleteStudyPlan(plan.id)}
            className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            title="削除"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    );
  };

  const renderTaskItem = (task: Task, isOverdue?: boolean) => {
    const isDone = task.status === 'completed';
    const isEditing = editingId === task.id;

    if (isEditing) {
      return (
        <div key={task.id} className="p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-lg animate-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">タスク名</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">締め切り日</label>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPriority}
                    onChange={(e) => setEditPriority(e.target.checked)}
                    className="rounded-lg border-slate-300 text-rose-500 focus:ring-rose-500 w-6 h-6"
                  />
                  <span className="text-xs font-bold text-slate-600">重要</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={cancelEditing} className="flex-1 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors">
                キャンセル
              </button>
              <button onClick={() => handleUpdate(task.id)} className="flex-[2] py-2.5 bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 rounded-xl transition-colors shadow-md">
                保存する
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        key={task.id} 
        className={cn(
          "flex items-center justify-between p-4 bg-white border rounded-2xl transition-all duration-200 group",
          isDone 
            ? "border-slate-100 bg-slate-50/50 opacity-60" 
            : "border-slate-200 hover:border-slate-300 hover:shadow-md",
          isOverdue && !isDone ? "border-rose-200 bg-rose-50/30" : ""
        )}
      >
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={() => updateTask(task.id, { status: isDone ? 'pending' : 'completed' })}
            className="flex-shrink-0"
          >
            {isDone ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : (
              <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400 transition-colors" />
            )}
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {task.isPriority && !isDone && <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
              <span className={cn(
                "font-bold text-sm lg:text-base truncate",
                isDone ? "text-slate-400 line-through" : "text-slate-900"
              )}>
                {task.title}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "text-[11px] font-bold uppercase tracking-tight",
                isOverdue && !isDone ? "text-rose-600" : "text-slate-400"
              )}>
                {format(parseISO(task.deadline), 'yyyy年M月d日 (E)', { locale: ja })}
              </span>
              {isOverdue && !isDone && (
                <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold uppercase">期限切れ</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => startEditing(task)}
            className="p-2.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            title="編集"
          >
            <Edit2 className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            title="削除"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-10 max-w-5xl mx-auto w-full">
      <header className="mb-8 lg:mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">タスク管理</h1>
        <p className="text-slate-500 mt-2 font-medium">単発の締め切りや予定（提出物、模試など）を管理します。</p>
      </header>

      {/* Overdue Items Section */}
      {(overdueTasks.length > 0 || overduePlans.length > 0) && (
        <section className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-sm font-bold text-rose-600 uppercase tracking-widest">最重要: 期限切れの項目</h2>
          </div>
          <div className="grid gap-3">
            {overdueTasks.map(task => renderTaskItem(task, true))}
            {overduePlans.map(plan => renderStudyPlanItem(plan))}
          </div>
        </section>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-8 mb-10 shadow-sm">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 lg:mb-6">新規タスクの追加</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">タスク名</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="例: 英語の課題プリント提出"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">締め切り日</label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>
            <div className="md:col-span-3 flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer group py-2">
                <input
                  type="checkbox"
                  checked={isPriority}
                  onChange={(e) => setIsPriority(e.target.checked)}
                  className="rounded-lg border-slate-300 text-rose-500 focus:ring-rose-500 w-6 h-6 transition-all"
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-1">
                  重要
                </span>
              </label>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="flex-1 px-6 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                追加
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">タスク一覧</h2>
            <button 
              onClick={() => setShowCompleted(!showCompleted)}
              className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                showCompleted ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >
              {showCompleted ? "完了済みを隠す" : "完了済みを表示"}
            </button>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
            {filteredTasks.length} 件
          </span>
        </div>
        
        {filteredTasks.length === 0 ? (
          <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm text-slate-400 font-medium">表示できるタスクはありません。</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTasks.map(task => renderTaskItem(task))}
          </div>
        )}
      </div>
    </div>
  );
}
