import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, CalendarRange, Calendar, CheckSquare, BookOpen, Menu, X, LogIn, LogOut, FileCode2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';
import { loginWithGoogle, logout } from '../lib/firebase';

export default function Layout() {
  const location = useLocation();
  const { user, isConfigured } = useData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'ダッシュボード', path: '/', icon: LayoutDashboard },
    { name: 'カレンダー', path: '/calendar', icon: Calendar },
    { name: '月間ロードマップ', path: '/monthly', icon: CalendarDays },
    { name: '週間プランナー', path: '/weekly', icon: CalendarRange },
    { name: 'タスク管理', path: '/tasks', icon: CheckSquare },
    { name: '教材管理', path: '/materials', icon: BookOpen },
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
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:transform-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">StudyFlow</h1>
          <button onClick={closeSidebar} className="lg:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 border-b border-slate-100">
          {user ? (
            <div className="flex items-center gap-3">
              <img src={user.photoURL || ''} alt="Profile" className="w-10 h-10 rounded-full border border-slate-200" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user.displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              ログインしていません
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-slate-300" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          {user ? (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </button>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              Googleでログイン
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">StudyFlow</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        <main className="flex-1 overflow-auto bg-slate-50/50">
          {!isConfigured ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center text-slate-500 font-medium">
                Firebaseの設定が必要です
              </div>
            </div>
          ) : !user ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <LogIn className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">ログインしてください</h2>
                <p className="text-slate-500 mb-6 text-sm">
                  StudyFlowを利用するには、Googleアカウントでのログインが必要です。
                </p>
                <button 
                  onClick={handleLogin}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Googleでログイン
                </button>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

