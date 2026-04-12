import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Trash2, PlayCircle, Archive, Inbox } from 'lucide-react';
import { Material, MaterialStatus } from '../types';
import { cn } from '../lib/utils';

const COLORS = [
  'bg-slate-500', 'bg-gray-500', 'bg-zinc-500', 'bg-neutral-500', 'bg-stone-500',
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500',
  'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
  'bg-pink-500', 'bg-rose-500'
];

export default function Materials() {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useData();
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[16]); // Default indigo
  const [activeTab, setActiveTab] = useState<MaterialStatus>('in-progress');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addMaterial({ name: newName.trim(), color: selectedColor, status: 'stocked' });
    setNewName('');
    setActiveTab('stocked');
  };

  const filteredMaterials = materials.filter(m => m.status === activeTab);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">教材管理</h1>
        <p className="text-slate-500 mt-1">学習に使用する教材や参考書を管理します。</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-medium text-slate-900 mb-4">新規教材の追加</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">教材名</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例: ターゲット1900"
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-2">テーマカラー</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-transform",
                    color,
                    selectedColor === color ? "ring-2 ring-offset-2 ring-slate-900 scale-110" : "hover:scale-110"
                  )}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!newName.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            ストックに追加
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('in-progress')}
            className={cn("pb-2 text-sm font-medium border-b-2 transition-colors", activeTab === 'in-progress' ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700")}
          >
            進行中 ({materials.filter(m => m.status === 'in-progress').length})
          </button>
          <button
            onClick={() => setActiveTab('stocked')}
            className={cn("pb-2 text-sm font-medium border-b-2 transition-colors", activeTab === 'stocked' ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700")}
          >
            ストック ({materials.filter(m => m.status === 'stocked').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={cn("pb-2 text-sm font-medium border-b-2 transition-colors", activeTab === 'completed' ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700")}
          >
            完了 ({materials.filter(m => m.status === 'completed').length})
          </button>
        </div>

        {filteredMaterials.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-4">このステータスの教材はありません。</p>
        ) : (
          <div className="grid gap-3">
            {filteredMaterials.map(material => (
              <div key={material.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", material.color)} />
                  <span className="font-medium text-slate-900">{material.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {material.status !== 'in-progress' && (
                    <button
                      onClick={() => updateMaterial(material.id, { status: 'in-progress' })}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="進行中にする"
                    >
                      <PlayCircle className="w-4 h-4" />
                    </button>
                  )}
                  {material.status !== 'stocked' && (
                    <button
                      onClick={() => updateMaterial(material.id, { status: 'stocked' })}
                      className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                      title="ストックに戻す"
                    >
                      <Inbox className="w-4 h-4" />
                    </button>
                  )}
                  {material.status !== 'completed' && (
                    <button
                      onClick={() => updateMaterial(material.id, { status: 'completed' })}
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                      title="完了にする"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <button
                    onClick={() => deleteMaterial(material.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
