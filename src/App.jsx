import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import { SURAH_DATA } from './utils/quranData';
import { AnimatePresence, motion } from 'framer-motion';

import SearchModal from './components/SearchModal';
import LogPage from './pages/LogPage';
import SettingsPage from './pages/SettingsPage';
import SurahListPage from './pages/SurahListPage';

// Placeholder pages
// Placeholder pages
import QuranReader from './pages/QuranReader';
// Connect Log and Settings
const Log = LogPage;
const Settings = SettingsPage;

function App() {
  // Notification Logic
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const settings = useSelector(state => state.settings);
  const [authView, setAuthView] = useState('login');
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewParams, setViewParams] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const handleNavigate = (view, params = null) => {
      setCurrentView(view);
      setViewParams(params);
  };

  useEffect(() => {
    if (!settings.notificationsEnabled || !settings.notificationTime || !user?.username) return;

    const checkTime = () => {
        try {
            const now = new Date();
            const [targetHour, targetMinute] = settings.notificationTime.split(':');
            
            if (now.getHours() === parseInt(targetHour) && now.getMinutes() === parseInt(targetMinute)) {
                // Check if already notified today? 
                // Simplified: Just notify. Browser throttles or user closes.
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Waktunya Ngaji!', {
                        body: `Assalamualaikum ${user.username}, ayo luangkan waktu untuk Al-Quran.`,
                        icon: '/quran-icon.svg'
                    });
                } else if ('Notification' in window && Notification.permission !== 'denied') {
                    Notification.requestPermission();
                }
            }
        } catch (error) {
            console.error('Notification error:', error);
        }
    };

    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [settings, user]);

  if (!isAuthenticated) {
    return authView === 'login' 
      ? <Login onSwitchToRegister={() => setAuthView('register')} />
      : <Register onSwitchToLogin={() => setAuthView('login')} />;
  }

  const renderView = () => {
    switch(currentView) {
        case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
        case 'read': return <QuranReader params={viewParams} onBack={() => handleNavigate('dashboard')} />;
        case 'surahList': return <SurahListPage onNavigate={handleNavigate} onBack={() => handleNavigate('dashboard')} />;
        case 'log': return <Log />;
        case 'settings': return <Settings />;
        default: return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  const getPageVariants = (view) => {
        if (view === 'read') { // Changed to 'read' to match currentView value
            return {
                initial: { y: '100%', opacity: 1 }, // Solid sheet
                animate: { y: 0, opacity: 1 },
                exit: { y: '100%', opacity: 1 }, // Slide down
                transition: { type: "spring", stiffness: 300, damping: 30 }
            };
        }
        // Default fade for tabs
        return {
            initial: { opacity: 0, scale: 0.98 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 1 },
            transition: { duration: 0.2, ease: "easeInOut" }
        };
    };

  const pageVariants = getPageVariants(currentView);

  return (
    <div className="bg-[#f0ece3] h-[100dvh] w-full flex justify-center overflow-hidden relative font-sans text-gray-900">
         {/* Global Islamic Geometric Pattern Background */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
             style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23064e3b' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
             }}
        ></div>

      <div className="w-full max-w-[480px] h-full bg-[#fdfaf5] shadow-2xl relative flex flex-col overflow-hidden">
        <AnimatePresence mode='wait' initial={false}>
            <Layout currentView={currentView} onNavigate={handleNavigate}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentView}
                        initial={pageVariants.initial}
                        animate={pageVariants.animate}
                        exit={pageVariants.exit}
                        transition={pageVariants.transition}
                        className="h-full"
                    >
                        {renderView()}
                    </motion.div>
                </AnimatePresence>
            </Layout>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
