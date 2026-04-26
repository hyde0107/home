/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import MonthlyPlanner from './pages/MonthlyPlanner';
import WeeklyPlanner from './pages/WeeklyPlanner';
import Tasks from './pages/Tasks';
import Materials from './pages/Materials';

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="monthly" element={<MonthlyPlanner />} />
            <Route path="weekly" element={<WeeklyPlanner />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="materials" element={<Materials />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
