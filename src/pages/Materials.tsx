import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Trash2, PlayCircle, Archive, Inbox, Edit2, X, Save } from 'lucide-react';
import { Material, MaterialStatus } from '../types';
import { MATERIAL_COLORS } from '../constants';
import { cn } from '../lib/utils';

export default function Materials() {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useData();
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(MATERIAL_COLORS[16]); // Default indigo
  const [activeTab, setActiveTab] = useState<MaterialStatus>('in-progress');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addMaterial({ name: newName.trim(), color: selectedColor, status: 'stocked' });
    setNewName('');
    setActiveTab('stocked');
  };

  const startEditing = (material: Material) => {
    setEditingId(material.id);
    setEditName(material.name);
    setEditColor(material.color);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    await updateMaterial(id, {
      name: editName.trim(),
      color: editColor
    });
    setEditingId(null);
  };

  const filteredMaterials = materials.filter(m => m.status === activeTab);

  return (
    <div className="p-4 lg:p-10 max-w-5xl mx-auto w-full">
      <header className="mb-8 lg:mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">教材管理</h1>
        <p className="text-slate-500 mt-2 font-medium">学習に使用する教材や参考書を管理します。</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 mb-10 shadow-sm">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">新規教材の追加</h2>
        <form onSubmit={handleAdd} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">教材名</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例: ターゲット1900"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">テーマカラー</label>
            <div className="flex flex-wrap gap-3">
              {MATERIAL_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all duration-200 shadow-sm",
                    color,
                    selectedColor === color ? "ring-4 ring-slate-900 ring-offset-2 scale-110" : "hover:scale-110"
                  )}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!newName.trim()}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            教材を登録する
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('in-progress')}
            className={cn(
              "px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-200",
              activeTab === 'in-progress' 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            進行中 <span className="ml-1 opacity-50">{materials.filter(m => m.status === 'in-progress').length}</span>
          </button>
          <button
            onClick={() => setActiveTab('stocked')}
            className={cn(
              "px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-200",
              activeTab === 'stocked' 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            ストック <span className="ml-1 opacity-50">{materials.filter(m => m.status === 'stocked').length}</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={cn(
              "px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-200",
              activeTab === 'completed' 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            完了 <span className="ml-1 opacity-50">{materials.filter(m => m.status === 'completed').length}</span>
          </button>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm text-slate-400 font-medium">このステータスの教材はありません。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.map(material => {
              const isEditing = editingId === material.id;
              
              if (isEditing) {
                return (
                  <div key={material.id} className="p-5 bg-white border-2 border-slate-900 rounded-2xl shadow-lg animate-in zoom-in-95 duration-200 space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <button onClick={cancelEditing} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleUpdate(material.id)} className="p-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors shadow-md">
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {MATERIAL_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditColor(color)}
                          className={cn(
                            "w-6 h-6 rounded-full transition-all duration-200",
                            color,
                            editColor === color ? "ring-2 ring-slate-900 ring-offset-1 scale-110" : "hover:scale-110"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={material.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-4 h-4 rounded-full shadow-sm", material.color)} />
                    <span className="font-bold text-slate-900">{material.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {material.status !== 'in-progress' && (
                      <button
                        onClick={() => updateMaterial(material.id, { status: 'in-progress' })}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="進行中にする"
                      >
                        <PlayCircle className="w-5 h-5" />
                      </button>
                    )}
                    {material.status !== 'stocked' && (
                      <button
                        onClick={() => updateMaterial(material.id, { status: 'stocked' })}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                        title="ストックに戻す"
                      >
                        <Inbox className="w-5 h-5" />
                      </button>
                    )}
                    {material.status !== 'completed' && (
                      <button
                        onClick={() => updateMaterial(material.id, { status: 'completed' })}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        title="完了にする"
                      >
                        <Archive className="w-5 h-5" />
                      </button>
                    )}
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <button
                      onClick={() => startEditing(material)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                      title="編集"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteMaterial(material.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      title="削除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
