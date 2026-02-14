import { useSelector, useDispatch } from 'react-redux';
import { clearLogs } from '../features/logs/logSlice';
import { useState, useMemo } from 'react';
import { SURAH_DATA } from '../utils/quranData';
import { BookOpen, CheckCircle, Clock, Calendar, BarChart2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LogPage() {
    const dispatch = useDispatch();
    const { history } = useSelector(state => state.logs);
    const { targetChunks, targetPeriod } = useSelector(state => state.settings); // default 1 juz / day

    // Calculate Progress
    const today = new Date().toISOString().split('T')[0];
    const todaysLogs = history.filter(h => h.date === today);
    
    // Calculate Progress based on PAGES (1 Log = 1 Page)
    // 1 Juz = 20 Pages.
    const pagesReadToday = todaysLogs.length; 
    const targetPages = (targetChunks || 1) * 20; 
    
    // Cap at 100% visually, but text can show more
    const progressPercent = Math.min(100, Math.round((pagesReadToday / targetPages) * 100));

    const [filterPeriod, setFilterPeriod] = useState('all'); // all, today, yesterday, week
    const [limit, setLimit] = useState(10);

    const filteredHistory = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const lastWeek = new Date(now);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastWeekTime = lastWeek.getTime();

        return history.filter(log => {
            if (filterPeriod === 'all') return true;
            if (filterPeriod === 'today') return log.date === todayStr;
            if (filterPeriod === 'yesterday') return log.date === yesterdayStr;
            if (filterPeriod === 'week') {
                const logTime = new Date(log.date).getTime();
                return logTime >= lastWeekTime;
            }
            return true;
        });
    }, [history, filterPeriod]);

    const displayedHistory = filteredHistory.slice(0, limit);

    const getSurahName = (number) => {
        const surah = SURAH_DATA.find(s => s.number === parseInt(number));
        return surah ? surah.name : `Surah ${number}`;
    };

    const formatDateTime = (dateStr, timeStr) => {
        if (!dateStr) return "-";
        
        const dateObj = new Date(dateStr);
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        const formattedDate = dateObj.toLocaleDateString('id-ID', options);
        
        return { date: formattedDate, time: timeStr };
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="h-full flex flex-col bg-sand-50">
            {/* Headers */}
            <div className="p-6 pb-2 space-y-6 z-10">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-serif font-bold text-primary-900 tracking-wide">Pencapaian</h2>
                    <div className="bg-sand-200 p-2 rounded-full text-primary-700">
                        <BarChart2 size={20} />
                    </div>
                </div>
                
                {/* Premium Target Card */}
                <div className="bg-gradient-to-br from-primary-900 to-primary-800 p-6 rounded-3xl shadow-xl text-sand-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <BookOpen size={120} />
                    </div>
                    
                    <div className="relative z-10">
                         <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="text-sand-300 text-sm font-medium uppercase tracking-wider mb-1">Target Harian</div>
                                <div className="text-2xl font-bold flex items-baseline gap-2">
                                    {targetChunks} Juz
                                    <span className="text-sm font-normal text-sand-300">({targetPages} Halaman)</span>
                                </div>
                            </div>
                            <div className="text-4xl font-bold text-sand-100">{progressPercent}%</div>
                        </div>
                        
                        <div className="w-full bg-primary-950/50 rounded-full h-4 overflow-hidden backdrop-blur-sm border border-primary-700">
                            <div 
                                className="bg-gradient-to-r from-sand-400 to-sand-200 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(212,175,55,0.5)]" 
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <div className="mt-3 text-xs text-sand-300 flex justify-between">
                            <span>0</span>
                            <span className="font-bold text-sand-100">{pagesReadToday} Halaman Terbaca</span>
                            <span>{targetPages}</span>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-primary-900 flex items-center gap-2">
                            <Clock size={18} className="text-primary-600"/> Riwayat
                        </h3>
                         <div className="flex gap-2">
                            <button 
                                onClick={() => {
                                    if(window.confirm('Yakin ingin menghapus semua riwayat bacaan?')) {
                                        dispatch(clearLogs());
                                    }
                                }}
                                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 hover:bg-red-100 transition"
                            >
                                Hapus
                            </button>
                            <div className="relative">
                                <Filter size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-primary-500" />
                                <select 
                                    value={filterPeriod} 
                                    onChange={(e) => setFilterPeriod(e.target.value)}
                                    className="bg-white border border-sand-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium text-primary-800 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition shadow-sm appearance-none"
                                >
                                    <option value="all">Semua</option>
                                    <option value="today">Hari Ini</option>
                                    <option value="yesterday">Kemarin</option>
                                    <option value="week">1 Minggu</option>
                                </select>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto px-6 pb-24 scroll-smooth">
                {displayedHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-primary-300 gap-2 opacity-60">
                        <BookOpen size={40} />
                        <span className="text-sm">Belum ada riwayat bacaan</span>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3"
                    >
                        {displayedHistory.map((log, idx) => {
                            const { date, time } = formatDateTime(log.date, log.time);
                            return (
                                <motion.div 
                                    key={idx} 
                                    variants={itemVariants}
                                    className="bg-white p-4 rounded-2xl shadow-sm border border-sand-100 flex justify-between items-center transition-all hover:shadow-md group will-change-transform"
                                >
                                    <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 flex items-center justify-center bg-sand-100 text-primary-800 font-bold text-sm rounded-full border border-sand-200 group-hover:bg-primary-50 group-hover:border-primary-200 transition-colors">
                                            {log.surah}
                                        </div>
                                        <div>
                                            <div className="font-bold text-primary-900 text-sm">{getSurahName(log.surah)}</div>
                                            <div className="text-xs text-primary-500 mt-0.5 flex items-center gap-1">
                                                <span className="bg-primary-50 px-1.5 py-0.5 rounded text-[10px] font-medium text-primary-700">Ayat {log.ayatStart}-{log.ayatEnd}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-primary-900">{date}</div>
                                        <div className="text-[10px] text-gray-400 font-medium">{time || '-'}</div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
