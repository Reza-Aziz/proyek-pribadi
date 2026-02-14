import { useSelector, useDispatch } from 'react-redux';
// We will simply invoke `setCurrentView` passed from props or use dispatch if we had UI slice.
// For now, passing `onNavigate` prop is easier.

import { SURAH_DATA } from '../utils/quranData';
import { getJuzForAyah } from '../utils/juzData';

const Dashboard = ({ onNavigate }) => {
  const { user } = useSelector(state => state.auth);
  const lastRead = useSelector(state => state.quran.lastRead);
  const { bookmarks } = useSelector(state => state.quran); // Keep bookmarks as it was in original
  const dispatch = useDispatch();
  
  // Get Surah Name, Ayah, and Juz
  const lastSurahName = lastRead ? SURAH_DATA.find(s => s.number === lastRead.surah)?.name : "";
  const lastJuz = lastRead ? getJuzForAyah(lastRead.surah, lastRead.ayah) : null;

    return (
    <div className="flex flex-col h-full bg-sand-50 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-900 via-primary-800 to-transparent opacity-10 pointer-events-none" />
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-[20%] left-[-100px] w-72 h-72 bg-sand-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

        <header className="p-8 pb-4 relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-sand-600 text-sm font-medium tracking-widest uppercase mb-1">Assalamualaikum,</h1>
                    <h2 className="text-3xl font-serif font-bold text-primary-900">{user.username}</h2>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-xl shadow-sm">
                    👤
                </div>
            </div>
            
            {/* Last Read Card - Optimized for Android (No Blur) */}
            <div 
                className="group relative overflow-hidden rounded-3xl bg-primary-900 text-sand-50 shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                onClick={() => onNavigate('read', null)}
            >
                {/* Abstract Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg width="100%" height="100%">
                        <pattern id="islamic-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
                            <circle cx="22" cy="22" r="1.5" fill="currentColor" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
                    </svg>
                </div>
                
                <div className="relative p-6 z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                             <span className="text-xs font-medium tracking-wider text-primary-200 uppercase">Terakhir Dibaca</span>
                        </div>
                        <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] border border-white/20 text-sand-100">
                            LANJUTKAN
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <h3 className="text-3xl font-serif font-bold tracking-wide text-sand-50">
                                {lastRead ? lastSurahName : "Mulai Membaca"}
                            </h3>
                            <p className="text-primary-200 text-sm font-medium">
                                {lastRead ? `Juz ${lastJuz} • Ayat ${lastRead.ayah}` : "Klik untuk membuka Mushaf"}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-sand-50/10 flex items-center justify-center border border-sand-50/20 group-hover:bg-sand-50/20 transition-colors">
                            <svg className="w-5 h-5 text-sand-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <main className="flex-1 p-8 pt-0 z-10 pb-24 space-y-6">
            <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary-600 rounded-full"></span>
                Jelajahi
            </h3>

            {/* Single Entry Point: Daftar Surat */}
            <div 
                onClick={() => onNavigate('surahList')}
                className="w-full bg-white rounded-3xl p-6 shadow-sm border border-sand-100/50 flex items-center gap-6 group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary-200"
            >
                <div className="w-20 h-20 bg-sand-100 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform duration-300 group-hover:bg-primary-50">
                    📖
                </div>
                <div className="flex-1">
                    <h4 className="text-xl font-bold text-primary-900 group-hover:text-primary-700 transition-colors">Daftar Surat</h4>
                    <p className="text-sm text-gray-500 mt-1 mr-4 leading-relaxed">
                        Jelajahi 114 surat dalam Al-Quran dengan terjemahan dan tafsir.
                    </p>
                </div>
                <div className="w-10 h-10 rounded-full border border-sand-200 flex items-center justify-center text-gray-400 group-hover:border-primary-200 group-hover:text-primary-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
            </div>

        </main>
    </div>
  );
}

export default Dashboard;
