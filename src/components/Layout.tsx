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
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Roadmap', path: '/monthly', icon: CalendarDays },
    { name: 'Planner', path: '/weekly', icon: CalendarRange },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Materials', path: '/materials', icon: BookOpen },
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
    <div className="flex h-[100dvh] bg-slate-50 text-slate-900 font-sans overflow-hidden select-none">
      {/* Sidebar - Only show if logged in and configured */}
      {isConfigured && user && (
        <>
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
              onClick={closeSidebar}
            />
          )}

          {/* Sidebar */}
          <aside className={cn(
            "fixed lg:relative inset-y-0 left-0 z-50 w-60 bg-white border-r border-slate-200/60 flex flex-col transform transition-transform duration-300 ease-in-out lg:transform-none lg:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="h-14 flex items-center justify-between px-5 border-b border-slate-100/60 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <FileCode2 className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">StudyFlow</h1>
              </div>
              <button onClick={closeSidebar} className="lg:hidden p-1 text-slate-400 hover:bg-slate-100 rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-3 border-b border-slate-100/60 bg-slate-50/30 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-white shadow-sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center border border-white shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400">{user.displayName?.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-900 truncate tracking-tight uppercase">{user.displayName}</p>
                  <p className="text-[8px] text-slate-400 truncate uppercase tracking-widest font-black leading-none mt-0.5">{user.email}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto custom-scrollbar">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                const Icon = item.icon;
                return (
                  <div className="px-2" key={item.path}>
                    <Link
                      to={item.path}
                      onClick={closeSidebar}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all duration-200 group",
                        isActive 
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                          : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5 transition-colors", isActive ? "text-slate-300" : "text-slate-400 group-hover:text-slate-600")} />
                      {item.name}
                    </Link>
                  </div>
                );
              })}
            </nav>

            <div className="p-3 border-t border-slate-100/60 flex-shrink-0">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header - Only if logged in */}
        {isConfigured && user && (
          <header className="lg:hidden h-14 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 sticky top-0 z-30 flex-shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xs font-black uppercase tracking-widest text-slate-900">StudyFlow</h1>
            <div className="w-10" />
          </header>
        )}

        <main className="flex-1 overflow-y-auto bg-slate-50/20 flex flex-col custom-scrollbar">
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
              <div className="max-w-[340px] w-full bg-white p-8 lg:p-10 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 text-center">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl -rotate-2">
                  <FileCode2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">StudyFlow</h2>
                <p className="text-slate-400 mb-8 text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed">
                  Manage your learning<br />
                  Log in to start
                </p>
                <button 
                  onClick={handleLogin}
                  className="inline-flex items-center justify-center gap-3 w-full px-6 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in with Google
                </button>
                <p className="mt-8 text-[9px] text-slate-300 font-black uppercase tracking-widest">
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

