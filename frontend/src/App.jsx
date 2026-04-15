import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { SocketProvider } from './context/SocketContext';

import Dashboard from './pages/Dashboard';
import InstagramClone from './pages/InstagramClone';
import InstagramLogin from './pages/InstagramLogin';
import TelegramClone from './pages/TelegramClone';
import TelegramLogin from './pages/TelegramLogin';
import WhatsAppClone from './pages/WhatsAppClone';
import WhatsAppLogin from './pages/WhatsAppLogin';
import ScreenshotAnalyzer from './pages/ScreenshotAnalyzer';
import UrlSandbox from './pages/UrlSandbox';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatAnalytics from './pages/ChatAnalytics';

function App() {
  console.log('App rendering');
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SocketProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/instagram" element={<InstagramClone />} />
              <Route path="/instagram/login" element={<InstagramLogin />} />
              <Route path="/telegram" element={<TelegramLogin />} />
              <Route path="/telegram-clone" element={<TelegramClone />} />
              <Route path="/whatsapp" element={<WhatsAppClone />} />
              <Route path="/whatsapp/login" element={<WhatsAppLogin />} />
              <Route path="/whatsapp/analytics" element={<ChatAnalytics />} />
              <Route path="/analyzer" element={<ScreenshotAnalyzer />} />
              <Route path="/url-sandbox" element={<UrlSandbox />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </Suspense>
        </div>
      </SocketProvider>
    </Router>
  );
}

export default App;