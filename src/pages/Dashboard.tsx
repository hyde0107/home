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
    <div className="p-4 lg:p-6 max-w-6xl mx-auto w-full space-y-4">
      {/* Header & Bento Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Greeting & Date */}
        <div className="md:col-span-2 flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {today.getHours() < 12 ? 'おはようございます' : today.getHours() < 18 ? 'こんにちは' : 'こんばんは'}
          </h1>
          <p className="text-slate-500 mt-1 text-base font-medium">
            {format(today, 'yyyy年 M月 d日 (E)', { locale: ja })}
          </p>
        </div>

        {/* Streak Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">連続学習記録</p>
            <p className="text-2xl font-black text-slate-900 leading-none">{streak} <span className="text-xs font-bold text-slate-500">日</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">今日の進捗</p>
            <p className="text-xl font-bold text-slate-900 leading-none">
              {completedToday} / {totalToday} <span className="text-xs font-medium text-slate-500">完了</span>
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              {totalToday === 0 ? '予定なし' : progressPercent === 100 ? '完璧！' : 'あと少し'}
            </p>
          </div>
          <CircularProgress percent={progressPercent} size={60} strokeWidth={8} />
        </div>

        {/* Study Tip Card */}
        <div className="md:col-span-2 bg-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-100 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Lightbulb className="w-20 h-20" />
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex-shrink-0 flex items-center justify-center backdrop-blur-sm">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-0.5 flex items-center gap-2">
              <Lightbulb className="w-3 h-3" />
              学習のヒント
            </h3>
            <p className="text-xs font-medium leading-normal line-clamp-2">
              {randomTip}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Column: Tasks */}
        <div className="space-y-4">
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                今日のタスク
              </h2>
              {combinedTasks.length > 0 && (
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {combinedTasks.filter(t => t.status === 'completed').length} / {combinedTasks.length}
                </span>
              )}
            </div>
            {combinedTasks.length > 0 ? (
              <div className="space-y-2">
                {combinedTasks.map(task => {
                  const isDone = task.status === 'completed';
                  const isOverdue = isBefore(parseISO(task.deadline), startOfDay(today));
                  return (
                    <div key={task.id} className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                      isDone 
                        ? "border-slate-100 bg-slate-50/50 opacity-60" 
                        : isOverdue 
                          ? "border-rose-200 bg-rose-50/30 hover:border-rose-300 hover:bg-white"
                          : "border-slate-100 bg-slate-50/30 hover:border-indigo-200 hover:bg-white"
                    )}>
                      <button onClick={() => toggleTaskStatus(task)} className="flex-shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className={cn("w-5 h-5 transition-colors", isOverdue ? "text-rose-300 hover:text-rose-400" : "text-slate-300 hover:text-indigo-400")} />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {(task.isPriority || isOverdue) && !isDone && <AlertCircle className={cn("w-3.5 h-3.5 flex-shrink-0", isOverdue ? "text-rose-600" : "text-rose-500")} />}
                          <p className={cn(
                            "text-sm font-bold truncate",
                            isDone ? "text-slate-400 line-through" : "text-slate-700"
                          )}>
                            {task.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-bold">今日のタスクはありません</p>
              </div>
            )}
          </section>

          {/* Tomorrow's Preview Section */}
          {tomorrowTasks.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-500" />
                  明日のタスク
                </h2>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {format(tomorrow, 'M/d (E)', { locale: ja })}
                </span>
              </div>
              
              <div className="space-y-2">
                {tomorrowTasks.map(task => {
                  const isDone = task.status === 'completed';
                  return (
                    <div key={task.id} className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                      isDone 
                        ? "border-slate-100 bg-slate-50/50 opacity-60" 
                        : "border-slate-100 bg-slate-50/30 hover:border-indigo-200 hover:bg-white"
                    )}>
                      <button onClick={() => toggleTaskStatus(task)} className="flex-shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-400 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-bold truncate",
                          isDone ? "text-slate-400 line-through" : "text-slate-700"
                        )}>
                          {task.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Study Plans */}
        <div className="space-y-4">
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                今日の学習予定
              </h2>
              {combinedPlans.length > 0 && (
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {combinedPlans.filter(p => p.isCompleted).length} / {combinedPlans.length}
                </span>
              )}
            </div>
            {combinedPlans.length > 0 ? (
              <div className="space-y-2">
                {combinedPlans.map(plan => {
                  const material = materials.find(m => m.id === plan.materialId) || {
                    id: 'none',
                    name: '指定なし',
                    color: 'bg-slate-300',
                    status: 'in-progress'
                  } as Material;
                  const isDone = plan.isCompleted;
                  const isOverdue = isBefore(parseISO(plan.date), startOfDay(today));

                  return (
                    <div key={plan.id} className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                      isDone 
                        ? "border-slate-100 bg-slate-50/50 opacity-60" 
                        : isOverdue
                          ? "border-rose-200 bg-rose-50/30 hover:border-rose-300 hover:bg-white"
                          : "border-slate-100 bg-slate-50/30 hover:border-indigo-200 hover:bg-white"
                    )}>
                      <button onClick={() => togglePlanStatus(plan)} className="flex-shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className={cn("w-5 h-5 transition-colors", isOverdue ? "text-rose-300 hover:text-rose-400" : "text-slate-300 hover:text-indigo-400")} />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "text-sm font-bold truncate",
                            isDone ? "text-slate-400 line-through" : "text-slate-700"
                          )}>
                            {plan.planText}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={cn("w-2 h-2 rounded-full", material.color)} />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{material.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-bold">今日の学習予定はありません</p>
              </div>
            )}
          </section>

          {/* Quick Diary */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PenLine className="w-5 h-5 text-indigo-500" />
                振り返り
              </h2>
              <button 
                onClick={handleSaveDiary}
                disabled={isSavingDiary || !diaryContent.trim()}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all",
                  isSavingDiary || !diaryContent.trim()
                    ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                )}
              >
                <Save className="w-3.5 h-3.5" />
                保存
              </button>
            </div>
            <textarea
              value={diaryContent}
              onChange={(e) => setDiaryContent(e.target.value)}
              placeholder="今日学んだことや、明日の目標をメモしましょう..."
              className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all resize-none font-medium leading-relaxed"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
