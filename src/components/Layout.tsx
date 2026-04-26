import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, CalendarRange, Calendar, CheckSquare, BookOpen, Menu, X, LogIn, LogOut, FileCode2, PenLine } from 'lucide-react';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';
import { loginWithGoogle, logout } from '../lib/firebase';

export default function Layout() {
  const location = useLocation();
  const { user, isConfigured, isLoadingAuth } = useData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'ダッシュボード', path: '/', icon: LayoutDashboard },
    { name: 'カレンダー', path: '/calendar', icon: Calendar },
    { name: '月間ロードマップ', path: '/monthly', icon: CalendarDays },
    { name: '週間プランナー', path: '/weekly', icon: CalendarRange },
    { name: 'タスク管理', path: '/tasks', icon: CheckSquare },
    { name: '教材管理', path: '/materials', icon: BookOpen },
    { name: '学習日記', path: '/diary', icon: PenLine },
  ];

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      alert(error instanceof Error ? error.message : "ログインに失敗しました。");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar - Only show if logged in and configured */}
      {isConfigured && user && (
        <>
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
              onClick={closeSidebar}
            />
          )}

          {/* Sidebar */}
          <aside className={cn(
            "fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:transform-none lg:translate-x-0 shadow-xl lg:shadow-none",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="h-14 flex items-center justify-between px-6 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <FileCode2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">StudyFlow</h1>
              </div>
              <button onClick={closeSidebar} className="lg:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-slate-200 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-slate-400">{user.displayName?.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-900 truncate tracking-tight">{user.displayName}</p>
                  <p className="text-[8px] text-slate-400 truncate uppercase tracking-widest font-black leading-none">{user.email}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 group",
                      isActive 
                        ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5 transition-colors", isActive ? "text-slate-300" : "text-slate-400 group-hover:text-slate-600")} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-2 border-t border-slate-100 flex-shrink-0">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                ログアウト
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header - Only if logged in */}
        {isConfigured && user && (
          <header className="lg:hidden h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30 flex-shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-base font-bold text-slate-900">StudyFlow</h1>
            <div className="w-10" />
          </header>
        )}

        <main className="flex-1 overflow-hidden bg-slate-50/50 flex flex-col">
          {!isConfigured ? (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-50 z-[100]">
              <div className="text-center animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-4" />
                <div className="text-slate-400 font-medium">Firebaseの設定を待機中...</div>
              </div>
            </div>
          ) : isLoadingAuth ? (
            <div className="fixed inset-0 bg-slate-50 z-[100]" />
          ) : !user ? (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-50 p-4 z-[100]">
              <div className="max-w-md w-full bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3">
                  <FileCode2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">StudyFlow</h2>
                <p className="text-slate-500 mb-10 text-sm lg:text-base leading-relaxed font-medium">
                  あなたの学習をスマートに管理。<br />
                  Googleアカウントで今すぐ始めましょう。
                </p>
                <button 
                  onClick={handleLogin}
                  className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all duration-300 shadow-lg shadow-slate-300 active:scale-[0.98]"
                >
                  <LogIn className="w-5 h-5" />
                  Googleでログイン
                </button>
                <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Secure & Private
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

