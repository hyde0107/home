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
      <header className="mb-6 lg:mb-8">
        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Materials</h1>
        <p className="text-slate-400 mt-1 font-black text-[9px] uppercase tracking-[0.2em] opacity-40">Manage resources</p>
      </header>

      <div className="bg-white border border-slate-200/60 rounded-xl p-4 lg:p-6 mb-8 shadow-sm">
        <h2 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">New Material</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Material Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex) Math Textbook"
              className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200/60 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
            />
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Color Theme</label>
            <div className="flex flex-wrap gap-2">
              {MATERIAL_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all duration-200 shadow-sm",
                    color,
                    selectedColor === color ? "ring-2 ring-slate-900 ring-offset-2 scale-110" : "hover:scale-110"
                  )}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!newName.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            Create
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('in-progress')}
            className={cn(
              "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all duration-200 flex items-center gap-1.5",
              activeTab === 'in-progress' 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            Active <span className="opacity-40">{materials.filter(m => m.status === 'in-progress').length}</span>
          </button>
          <button
            onClick={() => setActiveTab('stocked')}
            className={cn(
              "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all duration-200 flex items-center gap-1.5",
              activeTab === 'stocked' 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            Stock <span className="opacity-40">{materials.filter(m => m.status === 'stocked').length}</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={cn(
              "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all duration-200 flex items-center gap-1.5",
              activeTab === 'completed' 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            Done <span className="opacity-40">{materials.filter(m => m.status === 'completed').length}</span>
          </button>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200/60 rounded-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMaterials.map(material => {
              const isEditing = editingId === material.id;
              
              if (isEditing) {
                return (
                  <div key={material.id} className="p-4 bg-white border border-indigo-200 rounded-xl shadow-sm animate-in zoom-in-95 duration-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50/50 border border-slate-200/60 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button onClick={cancelEditing} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleUpdate(material.id)} className="p-1.5 bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg transition-colors shadow-sm">
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {MATERIAL_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditColor(color)}
                          className={cn(
                            "w-5 h-5 rounded-full transition-all duration-200",
                            color,
                            editColor === color ? "ring-2 ring-indigo-500 ring-offset-1 scale-110" : "hover:scale-110"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={material.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full shadow-sm flex-shrink-0", material.color)} />
                    <span className="font-bold text-sm tracking-tight text-slate-800">{material.name}</span>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {material.status !== 'in-progress' && (
                      <button
                        onClick={() => updateMaterial(material.id, { status: 'in-progress' })}
                        className="p-1.5 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Start"
                      >
                        <PlayCircle className="w-4 h-4" />
                      </button>
                    )}
                    {material.status !== 'stocked' && (
                      <button
                        onClick={() => updateMaterial(material.id, { status: 'stocked' })}
                        className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                        title="Move to Stock"
                      >
                        <Inbox className="w-4 h-4" />
                      </button>
                    )}
                    {material.status !== 'completed' && (
                      <button
                        onClick={() => updateMaterial(material.id, { status: 'completed' })}
                        className="p-1.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Complete"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    <div className="w-px h-3 bg-slate-200 mx-1" />
                    <button
                      onClick={() => startEditing(material)}
                      className="p-1.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMaterial(material.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
