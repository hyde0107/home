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
        <div key={plan.id} className="p-3 bg-white border border-indigo-200 rounded-xl shadow-sm animate-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Plan Details</label>
              <input
                autoFocus
                type="text"
                value={editPlanText}
                onChange={(e) => setEditPlanText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200/60 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
              <button onClick={() => setEditingPlanId(null)} className="px-3 py-1.5 text-slate-400 font-bold text-xs hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={() => handleUpdatePlan(plan.id)} className="px-3 py-1.5 bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-600 rounded-lg transition-colors shadow-sm">
                Save
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={plan.id} className="flex items-center justify-between p-3 bg-white border border-rose-200 bg-rose-50/50 rounded-xl transition-all duration-200 group">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={() => updateStudyPlan(plan.id, { isCompleted: true })}
            className="flex-shrink-0"
          >
            <Circle className="w-5 h-5 text-rose-300 hover:text-rose-400 transition-colors" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", material.color)} />
              <span className="font-bold text-sm truncate text-slate-800">
                {plan.planText}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-[2px]">
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-500">
                {format(parseISO(plan.date), 'yyyy.MM.dd')}
              </span>
              <span className="text-[8px] bg-rose-100/50 text-rose-600 px-1 py-[1px] rounded font-black uppercase tracking-wider">Missed</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 opacity-60 ml-1">{material.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setEditingPlanId(plan.id);
              setEditPlanText(plan.planText);
            }}
            className="p-1.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteStudyPlan(plan.id)}
            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
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
        <div key={task.id} className="p-3 bg-white border border-indigo-200 rounded-xl shadow-sm animate-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Task Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200/60 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Deadline</label>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200/60 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPriority}
                    onChange={(e) => setEditPriority(e.target.checked)}
                    className="rounded border-slate-300 text-rose-500 focus:ring-rose-500 w-4 h-4"
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Priority</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
              <button onClick={cancelEditing} className="px-3 py-1.5 text-slate-400 font-bold text-xs hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={() => handleUpdate(task.id)} className="px-3 py-1.5 bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-600 rounded-lg transition-colors shadow-sm">
                Save
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
          "flex items-center justify-between p-3 bg-white border rounded-xl transition-all duration-200 group",
          isDone 
            ? "border-transparent bg-transparent opacity-60" 
            : "border-slate-200/60 hover:border-slate-300",
          isOverdue && !isDone ? "border-rose-200 bg-rose-50/50" : ""
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
              <Circle className="w-5 h-5 text-slate-200 hover:text-slate-400 transition-colors" />
            )}
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {task.isPriority && !isDone && <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />}
              <span className={cn(
                "font-bold text-sm truncate tracking-tight transition-colors",
                isDone ? "text-slate-400 line-through font-medium" : "text-slate-800"
              )}>
                {task.title}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-[2px]">
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                isOverdue && !isDone ? "text-rose-500" : "text-slate-400"
              )}>
                {format(parseISO(task.deadline), 'yyyy.MM.dd')}
              </span>
              {isOverdue && !isDone && (
                <span className="text-[8px] bg-rose-100/50 text-rose-600 px-1 py-[1px] rounded font-black uppercase tracking-wider">Missed</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => startEditing(task)}
            className="p-1.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-10 max-w-5xl mx-auto w-full">
      <header className="mb-6 lg:mb-8">
        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Tasks</h1>
        <p className="text-slate-400 mt-1 font-black text-[9px] uppercase tracking-[0.2em] opacity-40">Manage your deadlines</p>
      </header>

      {/* Overdue Items Section */}
      {(overdueTasks.length > 0 || overduePlans.length > 0) && (
        <section className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em]">Overdue</h2>
          </div>
          <div className="grid gap-2">
            {overdueTasks.map(task => renderTaskItem(task, true))}
            {overduePlans.map(plan => renderStudyPlanItem(plan))}
          </div>
        </section>
      )}

      <div className="bg-white border border-slate-200/60 rounded-xl p-4 lg:p-6 mb-8 shadow-sm">
        <h2 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">New Task</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-6">
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Task Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex) Submit math assignment"
                className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-medium"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Deadline</label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-medium"
              />
            </div>
            <div className="md:col-span-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer group py-2">
                <input
                  type="checkbox"
                  checked={isPriority}
                  onChange={(e) => setIsPriority(e.target.checked)}
                  className="rounded border-slate-300 text-rose-500 focus:ring-rose-500 w-4 h-4 transition-all"
                />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-900 transition-colors">
                  Priority
                </span>
              </label>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <h2 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">All Tasks</h2>
            <button 
              onClick={() => setShowCompleted(!showCompleted)}
              className={cn(
                "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded transition-all",
                showCompleted ? "bg-slate-800 text-slate-100" : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              )}
            >
              {showCompleted ? "Hide Done" : "Show Done"}
            </button>
          </div>
          <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
            {filteredTasks.length} Items
          </span>
        </div>
        
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center border-dashed border-slate-200/60 border rounded-xl">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching tasks</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {filteredTasks.map(task => renderTaskItem(task))}
          </div>
        )}
      </div>
    </div>
  );
}
