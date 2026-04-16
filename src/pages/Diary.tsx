import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { format, parseISO, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Book, Calendar, Save, History, Smile, Meh, Frown } from 'lucide-react';
import { cn } from '../lib/utils';

const MOODS = [
  { icon: Smile, label: '良い', value: 'good', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { icon: Meh, label: '普通', value: 'neutral', color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: Frown, label: '悪い', value: 'bad', color: 'text-rose-500', bg: 'bg-rose-50' },
];

export default function Diary() {
  const { diaryEntries, saveDiaryEntry } = useData();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  const [editingDate, setEditingDate] = useState(todayStr);
  const currentEntry = diaryEntries.find(e => e.date === editingDate);
  
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Update content when editingDate or diaryEntries change
  React.useEffect(() => {
    const entry = diaryEntries.find(e => e.date === editingDate);
    setContent(entry?.content || '');
    setSelectedMood(entry?.mood || '');
  }, [editingDate, diaryEntries]);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      await saveDiaryEntry(editingDate, content, selectedMood);
      if (editingDate !== todayStr) {
        setEditingDate(todayStr); // Reset to today after editing past entry
      }
    } finally {
      setIsSaving(false);
    }
  };

  const pastEntries = [...diaryEntries]
    .sort((a, b) => b.date.localeCompare(a.date));

  const isEditingPast = editingDate !== todayStr;

  return (
    <div className="p-4 lg:p-10 max-w-5xl mx-auto w-full">
      <header className="mb-8 lg:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">学習日記</h1>
          <p className="text-slate-500 mt-2 font-medium">その日の学びや気づき、コンディションを記録します。</p>
        </div>
        {isEditingPast && (
          <button 
            onClick={() => setEditingDate(todayStr)}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            今日の記録に戻る
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          <section className={cn(
            "bg-white border rounded-[2rem] p-6 lg:p-8 shadow-sm transition-all duration-300",
            isEditingPast ? "border-amber-200 ring-4 ring-amber-50" : "border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                  isEditingPast ? "bg-amber-500 shadow-amber-100" : "bg-slate-900 shadow-slate-200"
                )}>
                  <Book className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {isEditingPast ? '過去の記録を編集' : '今日の記録'}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {format(parseISO(editingDate), 'yyyy.MM.dd (E)', { locale: ja })}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleSave}
                disabled={isSaving || !content.trim()}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg active:scale-95",
                  isSaving || !content.trim()
                    ? "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed"
                    : isEditingPast 
                      ? "bg-amber-500 text-white shadow-amber-100 hover:bg-amber-600"
                      : "bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800"
                )}
              >
                <Save className="w-4 h-4" />
                {isSaving ? '保存中...' : '保存する'}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  今日の気分
                </label>
                <div className="flex gap-3">
                  {MOODS.map((mood) => {
                    const Icon = mood.icon;
                    const isSelected = selectedMood === mood.value;
                    return (
                      <button
                        key={mood.value}
                        onClick={() => setSelectedMood(mood.value)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200",
                          isSelected 
                            ? cn("border-slate-900 bg-slate-50", mood.color) 
                            : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                        )}
                      >
                        <Icon className={cn("w-6 h-6", isSelected && mood.color)} />
                        <span className="text-xs font-bold">{mood.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  内容
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="今日は何を学びましたか？ 難しかったことや、明日への意気込みを書いてみましょう。"
                  className="w-full h-64 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all resize-none font-medium leading-relaxed"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Past Entries Sidebar */}
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col h-[600px]">
            <h2 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 flex-shrink-0">
              <History className="w-4 h-4 text-slate-400" />
              過去の記録
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {pastEntries.length > 0 ? (
                pastEntries.map((entry) => {
                  const mood = MOODS.find(m => m.value === entry.mood);
                  const MoodIcon = mood?.icon;
                  const isSelected = editingDate === entry.date;
                  return (
                    <button 
                      key={entry.id} 
                      onClick={() => setEditingDate(entry.date)}
                      className={cn(
                        "w-full text-left group p-4 rounded-2xl border transition-all duration-200",
                        isSelected 
                          ? "border-amber-500 bg-amber-50 shadow-md" 
                          : "border-slate-100 bg-slate-50/30 hover:bg-white hover:border-slate-200 hover:shadow-md"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            isSelected ? "text-amber-600" : "text-slate-500"
                          )}>
                            {format(parseISO(entry.date), 'yyyy.MM.dd (E)', { locale: ja })}
                          </span>
                        </div>
                        {MoodIcon && <MoodIcon className={cn("w-4 h-4", mood.color)} />}
                      </div>
                      <p className={cn(
                        "text-xs line-clamp-3 leading-relaxed font-medium",
                        isSelected ? "text-amber-900" : "text-slate-600"
                      )}>
                        {entry.content}
                      </p>
                    </button>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <History className="w-6 h-6 text-slate-200" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    記録がありません
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
