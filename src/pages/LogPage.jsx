import { useSelector, useDispatch } from 'react-redux';
import { clearLogs, deleteLog } from '../features/logs/logSlice';
import { useState, useMemo } from 'react';
import { SURAH_DATA } from '../utils/quranData';
import { BookOpen, CheckCircle, Clock, Calendar, BarChart2, Filter, Trash2, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LogPage() {
    const dispatch = useDispatch();
    const { history } = useSelector(state => state.logs);
    const { targetChunks, targetPeriod } = useSelector(state => state.settings); // default 1 juz / day

    // Calculate Progress
    const today = new Date().toISOString().split('T')[0];
    const todaysLogs = history.filter(h => h.date === today);
    const pagesReadToday = todaysLogs.length; 
    const targetPages = (targetChunks || 1) * 20; 
    const progressPercent = Math.min(100, Math.round((pagesReadToday / targetPages) * 100));

    const [filterPeriod, setFilterPeriod] = useState('all'); 
    const [limit, setLimit] = useState(10);

    // Modal State
    const [deleteModal, setDeleteModal] = useState({ show: false, type: null, index: null, log: null });

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
        return { 
            date: dateObj.toLocaleDateString('id-ID', options), 
            time: timeStr 
        };
    };

    const confirmDelete = () => {
        if (deleteModal.type === 'all') {
            dispatch(clearLogs());
        } else if (deleteModal.type === 'single' && deleteModal.index !== null) {
            dispatch(deleteLog(deleteModal.index));
        }
        setDeleteModal({ show: false, type: null, index: null, log: null });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="h-full flex flex-col bg-sand-50 relative">
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
                            {history.length > 0 && (
                                <button 
                                    onClick={() => setDeleteModal({ show: true, type: 'all' })}
                                    className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 hover:bg-red-100 transition"
                                >
                                    Hapus Semua
                                </button>
                            )}
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
                            
                            // Handle New vs Old Structure
                            const isNewFormat = !!log.start;
                            const startSurah = isNewFormat ? log.start.surah : log.surah;
                            const endSurah = isNewFormat ? log.end.surah : log.surah; // in old format, surah didn't change in a log
                            
                            const startAyat = isNewFormat ? log.start.ayat : log.ayatStart;
                            const endAyat = isNewFormat ? log.end.ayat : log.ayatEnd;

                            const isCrossSurah = startSurah !== endSurah;

                            return (
                                <motion.div 
                                    key={idx} 
                                    variants={itemVariants}
                                    onClick={() => {
                                        const originalIndex = history.indexOf(log);
                                        if (originalIndex !== -1) {
                                            setDeleteModal({ show: true, type: 'single', index: originalIndex, log: log });
                                        }
                                    }}
                                    className="bg-white p-4 rounded-2xl shadow-sm border border-sand-100 flex justify-between items-center transition-all hover:shadow-md group will-change-transform cursor-pointer hover:bg-red-50/50 hover:border-red-100 active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 flex min-w-[2.5rem] items-center justify-center bg-sand-100 text-primary-800 font-bold text-sm rounded-full border border-sand-200 group-hover:bg-primary-50 group-hover:border-primary-200 transition-colors">
                                            {startSurah}
                                        </div>
                                        <div>
                                            <div className="font-bold text-primary-900 text-sm">
                                                {isCrossSurah 
                                                    ? `${getSurahName(startSurah)} → ${getSurahName(endSurah)}`
                                                    : getSurahName(startSurah)}
                                            </div>
                                            <div className="text-xs text-primary-500 mt-0.5 flex items-center gap-1">
                                                <span className="bg-primary-50 px-1.5 py-0.5 rounded text-[10px] font-medium text-primary-700">
                                                    {isCrossSurah 
                                                        ? `Ayat ${startAyat} ... Ayat ${endAyat}`
                                                        : `Ayat ${startAyat}-${endAyat}`}
                                                </span>
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

            {/* Custom Delete Modal */}
            <AnimatePresence>
                {deleteModal.show && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/20 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl border border-sand-200 text-center relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                             <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                                <Trash2 size={24} />
                             </div>
                             
                             <h3 className="text-lg font-serif font-bold text-primary-900 mb-2">
                                {deleteModal.type === 'all' ? 'Hapus Semua Riwayat?' : 'Hapus Riwayat Ini?'}
                             </h3>
                             
                             <p className="text-sm text-primary-600 mb-6 px-2 leading-relaxed">
                                {deleteModal.type === 'all' 
                                    ? 'Apakah kamu yakin ingin menghapus seluruh catatan riwayat membaca? Tindakan ini tidak bisa dibatalkan.' 
                                    : `Hapus catatan bacaan ${deleteModal.log ? getSurahName(deleteModal.log.surah) : ''} ayat ${deleteModal.log?.ayatStart}-${deleteModal.log?.ayatEnd}?`}
                             </p>

                             <div className="flex gap-3">
                                 <button 
                                    onClick={() => setDeleteModal({ show: false, type: null, index: null, log: null })}
                                    className="flex-1 py-2.5 bg-sand-100 text-primary-700 rounded-xl font-bold text-sm hover:bg-sand-200 transition"
                                 >
                                    Batal
                                 </button>
                                 <button 
                                    onClick={confirmDelete}
                                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-red-600 transition"
                                 >
                                    Hapus
                                 </button>
                             </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
