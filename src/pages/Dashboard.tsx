import React from 'react';
import { useData } from '../context/DataContext';
import { format, parseISO, isBefore, startOfDay, subDays, isSameDay, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CheckCircle2, Circle, AlertCircle, BookOpen, PenLine, Save, Flame, Lightbulb, X, Trophy, Target, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { Task, StudyPlan, Material, DiaryEntry } from '../types';

const STUDY_TIPS = [
  "「1ページだけ読む」「計算を1問だけ解く」など、脳が拒否反応を起こさないほど小さな一歩から始めましょう。",
  "勉強する場所を固定しましょう。その椅子に座るだけで、脳が自動的に『勉強モード』へ切り替わるようになります。",
  "耳栓やノイズキャンセリングを活用して、外界の音をシャットアウト。自分だけの集中空間を作り出します。",
  "立ち上がって音読してみましょう。運動と学習を組み合わせることで、記憶の定着が20%向上するという研究もあります。",
  "SNSの通知はオフではなく、アプリ自体を消すかログアウト。アクセスの障壁を高くすることが最強の対策です。",
  "「エビングハウスの忘却曲線」を意識しましょう。覚えた直後、1日後、1週間後に復習するのが最も効率的です。",
  "夜の勉強は、暗記ものに特化しましょう。睡眠は知識の『定着』という重要な工程の一部です。",
  "白紙に今日学んだことを思いつく限り書き出す『ブレイン・ダンプ』。自分の理解の穴が一瞬でわかります。",
  "勉強の合間にココアやダークチョコレートを。フラバノールが脳の血流を促し、認知機能をサポートします。",
  "目標は『SMART』に。具体的(S)で、測定可能(M)で、達成可能(A)で、価値があり(R)で、期限がある(T)目標を立てましょう。",
  "15分の昼寝は夜の睡眠3時間に匹敵する回復力があります。タイマーをセットして、眠りすぎないようにしましょう。",
  "苦手科目は「20分だけ」と決めて取り組む。終わりの時間を決めると、脳はそこまで全力で走ろうとします。",
  "BGMは歌詞のないインストゥルメンタルや環境音を。言語情報は読解や記憶の邪魔になることがあります。",
  "「なぜ自分はこれを学びたいのか？」という目的意識を週に一度は再確認しましょう。動機が行動を支えます。",
  "過去問は早めに解きましょう。敵を知ることで、今の自分に足りないものが明確になります。",
  "指で文字を追いながら読む『指差し確認読書』。視線が散らばらず、集中力が格段に上がります。",
  "ノートは余白をたっぷり作りましょう。後から気づいたことを書き込むスペースが、思考を広げます。",
  "勉強のご褒美は『終わった後』に。好きな動画やゲームをモチベーションの着火剤として使いましょう。",
  "「教えることは二度学ぶこと」です。架空の生徒に向かって、今学んだことを説明してみてください。",
  "散歩中に、今日覚えた単語を頭の中で復習する。机に向かっていない時間にこそ、真の学力は伸びます。",
  "完璧な計画より、柔軟な計画を。週に1日は『予備日』を作り、遅れを取り戻せる余裕を持たせましょう。",
  "「成功の反対は失敗ではなく、何もしないことだ」という言葉を、心が折れそうな時に思い出してください。",
  "水をこまめに飲みましょう。脱水状態は集中力と記憶力を著しく低下させます。",
  "ライバルや仲間を見つける。他人の頑張りが見える環境は、自分の甘えを消し去ってくれます。",
  "TODOリストは前日の夜に作っておく。朝起きてすぐに『何をすべきか』で迷うエネルギーを節約しましょう。",
  "「天才とは努力する凡才のことである」というアインシュタインの言葉を信じて、今日の一歩を刻みましょう。",
  "「やり始めてしまえば、半分終わったようなものだ」という言葉があります。最初の一文字を書くことが最大の難関です。",
  "「失敗は成功のもと」ではなく「失敗はデータ」です。間違えた問題は、次に正解するための貴重なヒントになります。",
  "「明日からやろう」という言葉を「今から5分だけやろう」に書き換える。それが未来を変える唯一の方法です。",
  "『継続は力なり』。1日10時間の勉強をたまにするより、1日15分を毎日続ける方が脳の構造は変わります。",
  "「学べば学ぶほど、自分が何も知らなかったことに気づく」。その無知の自覚こそが、真のインテリジェンスの始まりです。",
  "「勝ちに不思議の勝ちあり、負けに不思議の負けなし」。模試の結果に一喜一憂せず、間違えた原因を徹底的に分析しましょう。",
  "「意志があるところに道は開ける」。どうしても達成したい理由を明確にすれば、脳は勝手に解決策を探し始めます。",
  "「人と同じことをして、違う結果を望むのは狂気だ」。自分に合った独自の勉強法を模索し続けましょう。",
  "「最も強い者が生き残るのではなく、最も変化に強い者が生き残る」。学習環境や計画を柔軟にアップデートし続けてください。",
  "「木を切り倒すのに6時間与えられたら、私は最初の4時間を斧を研ぐのに費やす」。勉強前の計画と準備が結果を左右します。",
  "「本を読まない人は、字の読めない人と変わらない」。知識は人生という荒波を渡るための最大の武器です。",
  "「苦境にあるときこそ、自分を成長させる絶好の機会だ」。難しい単元こそ、ライバルに差をつけるチャンスです。",
  "「情熱に勝る才能はない」。好きなことを見つけるか、今の学習の中に『面白さ』を見つけ出す工夫をしましょう。",
  "「昨日の自分より、今日何を知っているか」。他人との比較をやめると、学習は一気に楽しくなります。",
  "「小さなことを積み重ねることが、とんでもないところへ行くただ一つの道」。イチロー選手の哲学を日々の習慣に。 ",
  "「行動はすべての成功の基本的な鍵である」。理屈をこねる前に、まずは参考書を開いてみてください。",
  "「限界を決めるのはいつも自分の心だ」。『できない』を『どうすればできるか？』に変換する習慣をつけましょう。",
  "「成功とは、意欲を失わずに失敗を繰り返すことである」。チャーチルの言葉を胸に、不合格やミスを恐れず突き進みましょう。",
  "「一生懸命努力しても報われないことはあるが、努力し続けることでしか道は拓けない」。プロセスそのものを愛しましょう。"
];

function CircularProgress({ percent, size = 80, strokeWidth = 8 }: { percent: number, size?: number, strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-indigo-600 transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-lg font-bold text-slate-900">{percent}%</span>
    </div>
  );
}

export default function Dashboard() {
  const { tasks, materials, studyPlans, diaryEntries, updateTask, updateStudyPlan, saveDiaryEntry } = useData();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const [randomTip] = React.useState(() => STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)]);

  // Streak calculation - improved logic
  const streak = React.useMemo(() => {
    if (studyPlans.length === 0 && diaryEntries.length === 0) return 0;
    
    let count = 0;
    let curr = new Date();
    
    const wasActive = (date: Date) => {
      const dStr = format(date, 'yyyy-MM-dd');
      // A day is active if at least one study plan was completed OR a diary entry was made
      const hasCompletedPlan = studyPlans.some(p => p.date === dStr && p.isCompleted);
      const hasDiary = diaryEntries.some(e => e.date === dStr && e.content.trim().length > 0);
      return hasCompletedPlan || hasDiary;
    };

    // If not active today, check if yesterday was active to continue the streak
    if (!wasActive(curr)) {
      curr = subDays(curr, 1);
    }

    // Go backwards as long as the day was active
    while (wasActive(curr)) {
      count++;
      curr = subDays(curr, 1);
      if (count > 365) break; 
    }
    return count;
  }, [studyPlans, diaryEntries]);

  // Filter tasks
  const todayOnlyTasks = tasks.filter(t => t.deadline === todayStr);
  
  const tomorrow = addDays(today, 1);
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
  const tomorrowTasks = tasks.filter(t => t.deadline === tomorrowStr);

  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed') return false;
    const deadlineDate = parseISO(t.deadline);
    return isBefore(deadlineDate, startOfDay(today));
  });

  // Merge today's tasks and overdue tasks
  const combinedTasks = [...overdueTasks, ...todayOnlyTasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    return a.deadline.localeCompare(b.deadline);
  });

  const overduePlans = studyPlans.filter(p => {
    if (p.isCompleted) return false;
    const planDate = parseISO(p.date);
    return isBefore(planDate, startOfDay(today));
  });

  // Filter study plans
  const todayOnlyPlans = studyPlans.filter(p => p.date === todayStr);
  const tomorrowPlans = studyPlans.filter(p => p.date === tomorrowStr);

  // Merge today's plans and overdue plans
  const combinedPlans = [...overduePlans, ...todayOnlyPlans].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    return a.date.localeCompare(b.date);
  });

  // Today's Progress
  const totalToday = combinedTasks.length + combinedPlans.length;
  const completedToday = combinedTasks.filter(t => t.status === 'completed').length + combinedPlans.filter(p => p.isCompleted).length;
  const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // Diary
  const todayEntry = diaryEntries.find(e => e.date === todayStr);
  const [diaryContent, setDiaryContent] = React.useState(todayEntry?.content || '');
  const [isSavingDiary, setIsSavingDiary] = React.useState(false);

  React.useEffect(() => {
    if (todayEntry) setDiaryContent(todayEntry.content);
  }, [todayEntry]);

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask(task.id, { status: newStatus });
  };

  const togglePlanStatus = (plan: StudyPlan) => {
    updateStudyPlan(plan.id, { isCompleted: !plan.isCompleted });
  };

  const handleSaveDiary = async () => {
    if (!diaryContent.trim()) return;
    setIsSavingDiary(true);
    try {
      await saveDiaryEntry(todayStr, diaryContent, todayEntry?.mood);
    } finally {
      setIsSavingDiary(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto w-full space-y-5">
      {/* Header & Quick stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="pl-1">
          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
            {today.getHours() < 12 ? 'おはようございます' : today.getHours() < 18 ? 'こんにちは' : 'こんばんは'}
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5 opacity-60">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {format(today, 'yyyy / MM / dd (E)', { locale: ja })}
          </p>
        </div>
        
        <div className="bg-white border border-slate-200/60 rounded-xl p-2 shadow-sm flex items-center gap-2.5 pr-4 transition-all hover:border-orange-200 group">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center border border-orange-100 group-hover:bg-orange-100 transition-colors">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Streak</p>
            <p className="text-base font-black text-slate-900 leading-none">{streak} <span className="text-[9px] text-slate-300 font-bold tracking-tight">days</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Progress Card */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-3 shadow-sm flex items-center justify-between hover:border-indigo-100 transition-colors">
          <div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-2">Today</p>
            <p className="text-base font-black text-slate-900 leading-none">
              {completedToday} <span className="text-slate-200 text-xs">/ {totalToday}</span>
            </p>
          </div>
          <CircularProgress percent={progressPercent} size={42} strokeWidth={8} />
        </div>

        {/* Tip Card - Subtle and sleek */}
        <div className="md:col-span-2 bg-slate-900 rounded-xl p-3 text-white flex items-center gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 scale-125 transition-transform group-hover:scale-150 duration-500">
            <Lightbulb className="w-12 h-12" />
          </div>
          <div className="w-8 h-8 bg-white/10 rounded-lg flex-shrink-0 flex items-center justify-center border border-white/5 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-medium text-slate-400 italic leading-snug line-clamp-1 max-w-[95%]">
              "{randomTip}"
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left: Tasks */}
        <div className="space-y-5">
          <section className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                Tasks
              </h2>
            </div>
            
            {combinedTasks.length > 0 ? (
              <div className="space-y-1">
                {combinedTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group">
                    <button onClick={() => toggleTaskStatus(task)} className="flex-shrink-0">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                      )}
                    </button>
                    <p className={cn(
                      "text-xs font-bold truncate tracking-tight transition-all",
                      task.status === 'completed' ? "text-slate-300 line-through font-medium" : "text-slate-600 group-hover:text-slate-900"
                    )}>
                      {task.title}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-[9px] font-black text-slate-200 uppercase tracking-widest">No plans yet</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Plans & Diary */}
        <div className="space-y-5">
          <section className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm">
            <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              Schedule
            </h2>
            <div className="space-y-1">
              {combinedPlans.map(plan => {
                const material = materials.find(m => m.id === plan.materialId);
                return (
                  <div key={plan.id} className="flex flex-col p-2 rounded-lg border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-3">
                      <button onClick={() => togglePlanStatus(plan)} className="flex-shrink-0">
                        {plan.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                        )}
                      </button>
                      <p className={cn("text-xs font-bold truncate tracking-tight", plan.isCompleted ? "text-slate-300 line-through font-medium" : "text-slate-600 group-hover:text-slate-900")}>
                        {plan.planText}
                      </p>
                    </div>
                    {material && (
                      <div className="flex items-center gap-1.5 mt-1 ml-7 opacity-80">
                        <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm", material.color)} />
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{material.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white border border-slate-900/10 rounded-xl p-4 shadow-lg shadow-slate-100 relative">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2">
                <PenLine className="w-3 h-3" />
                Notes
              </h2>
              <button 
                onClick={handleSaveDiary}
                disabled={isSavingDiary || !diaryContent.trim()}
                className="text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-700 disabled:opacity-20 transition-all"
              >
                {isSavingDiary ? 'Syncing...' : 'Quick Save'}
              </button>
            </div>
            <textarea
              value={diaryContent}
              onChange={(e) => setDiaryContent(e.target.value)}
              placeholder="What did you achieve today?"
              className="w-full h-20 bg-slate-50/50 border-none rounded-lg p-2.5 text-[12px] text-slate-600 placeholder:text-slate-200 focus:ring-0 resize-none font-medium"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
