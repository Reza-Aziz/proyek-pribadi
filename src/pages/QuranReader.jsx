import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuranPage } from '../hooks/useQuranPage';
import { setLastRead } from '../features/quran/quranSlice';
import { updateSettings } from '../features/settings/settingsSlice';
import { SURAH_DATA } from '../utils/quranData';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Plus, Minus, Type, CheckCircle } from 'lucide-react';

export default function QuranReader({ onBack, params }) {
    const dispatch = useDispatch();
    const { lastRead } = useSelector(state => state.quran);
    const { fontSize } = useSelector(state => state.settings);
    
    // Initial state priority: params > lastRead > default
    const [position, setPosition] = useState(() => {
        if (params) return { surah: parseInt(params.surah), ayah: parseInt(params.ayah || 1) };
        return lastRead || { surah: 1, ayah: 1 };
    });

    const [direction, setDirection] = useState(0);
    const [showFontSettings, setShowFontSettings] = useState(false);

    // Update position if params change specifically
    useEffect(() => {
        if (params) {
            const newPos = { surah: parseInt(params.surah), ayah: parseInt(params.ayah || 1) };
            setDirection(0); 
            if (newPos.surah > position.surah || (newPos.surah === position.surah && newPos.ayah > position.ayah)) {
                setDirection(1);
            } else {
                 setDirection(-1);
            }
            setPosition(newPos);
        }
    }, [params]);
    
    const { loading, segments, nextStart, prevStart } = useQuranPage(position.surah, position.ayah);
    const containerRef = useRef(null);
    
    // Overscroll Logic State
    const [touchStart, setTouchStart] = useState(null);
    const [pullDelta, setPullDelta] = useState(0);
    const PULL_THRESHOLD = 120; 

    // Bookmark Modal State
    const [bookmarkModal, setBookmarkModal] = useState({ show: false, surah: null, ayah: null });

    // Save position to LastRead whenever it changes
    useEffect(() => {
        dispatch(setLastRead(position));
        
        // Scroll Management
        if (containerRef.current) {
             // Use setTimeout to ensure DOM has updated with new segments
            setTimeout(() => {
                if (direction === 1) { // Next Page
                     containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
                } else if (direction === -1) { // Prev Page
                     containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'instant' });
                }
            }, 50); // Small delay to allow framer-motion/react render
        }
    }, [position, dispatch, direction]);

    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        if (!touchStart) return;
        const currentY = e.touches[0].clientY;
        const delta = currentY - touchStart;
        
        const container = containerRef.current;
        if (!container) return;

        if (container.scrollTop === 0 && delta > 0) {
            setPullDelta(delta);
        }
        else if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5 && delta < 0) {
             setPullDelta(delta);
        } else {
            setPullDelta(0);
        }
    };

    // Logging and Alert Logic (Preserved)
    const [startSessionPos] = useState(position); 
    
    useEffect(() => {
        if (position.surah !== startSessionPos.surah || position.ayah !== startSessionPos.ayah) {
             const timer = setTimeout(() => {
                 const today = new Date().toISOString().split('T')[0];
                 const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                 
                 dispatch({ 
                    type: 'logs/addLog', 
                    payload: { 
                        date: today, 
                        time, 
                        surah: position.surah, 
                        ayatStart: position.ayah, 
                        ayatEnd: position.ayah + 15, 
                        count: 15 
                    } 
                 });
             }, 2000); 

             return () => clearTimeout(timer);
        }
    }, [position, dispatch, startSessionPos]);

    useEffect(() => {
        const startTotal = startSessionPos.surah * 200 + startSessionPos.ayah; 
        const currTotal = position.surah * 200 + position.ayah;
        const diffAyahs = Math.abs(currTotal - startTotal);
        const diffPages = Math.floor(diffAyahs / 15);
        
        const handleUnload = (e) => {
            let msg = '';
            if (diffPages < 5 && diffPages > 0) msg = `Ayo, 5 halaman lah minimal. Baru ${diffPages}`; 
            
            if (msg) {
                e.preventDefault();
                e.returnValue = msg; 
                return msg;
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [position, startSessionPos]);

    const handleTouchEnd = () => {
        if (pullDelta > PULL_THRESHOLD && prevStart) {
            setDirection(-1);
            setPosition(prevStart);
        } else if (pullDelta < -PULL_THRESHOLD && nextStart) {
            setDirection(1);
            setPosition(nextStart);
        }
        setTouchStart(null);
        setPullDelta(0);
    };

    const handleAyahClick = (surah, ayah) => {
        setBookmarkModal({ show: true, surah, ayah });
    };

    const confirmBookmark = () => {
        const { surah, ayah } = bookmarkModal;
        dispatch(setLastRead({ surah, ayah, page: 1 })); 
        
        const today = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        dispatch({ 
            type: 'logs/addLog', 
            payload: { date: today, time, surah, ayatStart: ayah, ayatEnd: ayah, count: 0 } 
        });

        setBookmarkModal({ show: false, surah: null, ayah: null });
    };

    const updateFontSize = (newSize) => {
        const size = Math.min(60, Math.max(16, newSize)); // Limit between 16px and 60px
        dispatch(updateSettings({ fontSize: size }));
    };

    const pageVariants = {
        enter: (direction) => ({
            y: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        },
        exit: (direction) => ({
            y: direction > 0 ? -50 : 50,
            opacity: 0,
            transition: {
                duration: 0.2
            }
        })
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 500, damping: 25 } }
    };

    return (
        <div className="flex flex-col h-full bg-[#fdfaf5] relative overflow-hidden">
            {/* Premium Header - Optimized (No Blur) */}
            <div className="bg-primary-900 text-sand-50 p-4 pt-8 md:pt-4 flex justify-between items-center z-20 shadow-md border-b border-sand-400 relative">
                 {/* Decorative Pattern in Header */}
                 <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-sand-400 to-transparent opacity-50"></div>

                <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 active:scale-95 transition hover:bg-white/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                
                <div className="text-center">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-sand-300 mb-1 font-sans">Surah</div>
                    <div className="font-serif text-xl sm:text-2xl font-bold text-sand-50 tracking-wide drop-shadow-md">
                       {segments[0]?.surah ? SURAH_DATA.find(s => s.number === segments[0].surah)?.name : "Loading..."}
                    </div>
                </div>

                <div className="w-10"></div> {/* Spacer for alignment since menu is gone */}
            </div>

            {/* Bookmark Modal - Optimized (Solid BG) */}
            <AnimatePresence>
                {bookmarkModal.show && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary-900/40">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-[#fdfaf5] p-8 rounded-[2rem] shadow-2xl w-3/4 max-w-sm border border-white/50 relative overflow-hidden"
                        >
                             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-50 to-transparent pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-inner border border-sand-100 text-primary-600">
                                        🔖
                                    </div>
                                </div>
                                <h3 className="font-serif font-bold text-2xl text-center text-primary-900 mb-3">Simpan Bacaan?</h3>
                                <p className="text-gray-600 text-center mb-8 leading-relaxed text-sm font-medium">
                                    Menandai <span className="text-primary-800 font-bold mx-1 border-b-2 border-primary-200">{SURAH_DATA.find(s => s.number === bookmarkModal.surah)?.name} ayat {bookmarkModal.ayah}</span> sebagai terakhir dibaca.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={confirmBookmark}
                                        className="w-full py-4 bg-primary-900 text-white rounded-xl font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-800 transition transform active:scale-[0.98] text-sm flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} /> Simpan Penanda
                                    </button>
                                    <button 
                                        onClick={() => setBookmarkModal({ show: false, surah: null, ayah: null })}
                                        className="w-full py-4 text-primary-500 font-bold hover:bg-primary-50 rounded-xl transition text-sm"
                                    >
                                        Batalkan
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Pull Indicator Layer - Optimized (No Blur) */}
            <AnimatePresence>
                {Math.abs(pullDelta) > 50 && (
                    <motion.div 
                        initial={{ opacity: 0, y: pullDelta > 0 ? -20 : 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`absolute left-0 right-0 z-20 flex justify-center items-center pointer-events-none
                            ${pullDelta > 0 ? 'top-20' : 'bottom-24'}`}
                    >
                        <div className="bg-primary-900/95 text-sand-50 px-6 py-3 rounded-full shadow-lg text-sm font-bold tracking-wide flex items-center gap-3 border border-white/10">
                             <motion.span 
                                animate={{ rotate: pullDelta > 0 ? 180 : 0 }}
                                className="text-sand-300"
                             >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                             </motion.span>
                             <span>
                                {pullDelta > 0 
                                    ? (pullDelta > PULL_THRESHOLD ? "Lepas untuk sebelumnya" : "Tarik lagi") 
                                    : (pullDelta < -PULL_THRESHOLD ? "Lepas untuk selanjutnya" : "Tarik lagi")}
                             </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reader Content - Fixed List Mode */}
            <div 
                ref={containerRef}
                className="flex-1 overflow-y-auto p-0 relative bg-[#fdfaf5]" 
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Fixed position background */}
                <div className="fixed top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary-50/10 to-transparent pointer-events-none z-0"></div>

                <motion.div 
                    animate={{ y: pullDelta * 0.3 }} 
                    transition={{ type: "spring", stiffness: 400, damping: 40 }}
                    className="min-h-full max-w-2xl mx-auto relative z-10 pb-16" // Minimal bottom padding as requested
                >
                    <AnimatePresence initial={false} custom={direction} mode='popLayout'>
                        <motion.div
                            key={`${position.surah}-${position.ayah}`}
                            custom={direction}
                            variants={pageVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                        >
                            {loading ? (
                                <div className="flex flex-col justify-center items-center h-[60vh] gap-6">
                                     <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-sand-200 border-t-primary-900"></div>
                                     <div className="text-primary-900 font-serif animate-pulse tracking-widest text-xs uppercase font-bold">Memuat Halaman...</div>
                                </div>
                            ) : segments.length === 0 ? (
                                <div className="flex flex-col justify-center items-center h-[60vh] gap-4 text-center p-8">
                                    <div className="text-4xl">⚠️</div>
                                    <h3 className="font-bold text-primary-900 text-lg">Gagal Memuat Data</h3>
                                    <p className="text-sm text-primary-700">Tidak dapat memuat ayat Al-Quran. Pastikan koneksi internet lancar atau data tersedia.</p>
                                </div>
                            ) : (
                                <div className="px-4 py-4"> 
                                    {segments.map((seg, idx) => {
                                        // Header
                                        if (seg.type === 'header') {
                                            return (
                                                <motion.div key={`head-${idx}`} variants={itemVariants} className="py-8 text-center relative mb-4">
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                                         <div className="w-56 h-56 border-[1px] border-primary-900 rounded-full scale-110"></div>
                                                    </div>
                                                    
                                                    <div className="relative z-10">
                                                        <div className="text-5xl text-primary-900 font-arabic mb-4 font-bold leading-relaxed drop-shadow-sm opacity-90">
                                                          ﷽
                                                        </div>
                                                        <div className="inline-flex items-center gap-4">
                                                            <div className="h-[1px] w-8 bg-primary-300"></div>
                                                            <div className="text-xs font-serif tracking-[0.2em] text-primary-900 uppercase font-bold">
                                                                Surah {seg.name}
                                                            </div>
                                                            <div className="h-[1px] w-8 bg-primary-300"></div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        }

                                        // Fixed Layout: Text Right, Number Left
                                        return (
                                            <motion.div 
                                                key={`ayah-${seg.surah}-${seg.number}`} 
                                                variants={itemVariants}
                                                onClick={() => handleAyahClick(seg.surah, seg.number)}
                                                className="relative group transition-colors duration-200 flex flex-row-reverse items-start gap-5 py-3 border-b border-sand-200/40"
                                            >
                                                {/* Text - Fixed Font Site */}
                                                <p 
                                                    className="font-arabic text-primary-900 drop-shadow-sm flex-1 text-right"
                                                    style={{ 
                                                        fontSize: '20px', // "10px" feel for Arabic
                                                        lineHeight: '2.2',
                                                        paddingTop: '0'
                                                    }} 
                                                >
                                                    {seg.text}
                                                </p>

                                                {/* Number - Left Side */}
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-sand-300/50 bg-sand-100/30 flex items-center justify-center text-xs font-bold text-primary-400 mt-2">
                                                    {seg.number}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    
                                    {/* Minimalist Footer */}
                                    <motion.div variants={itemVariants} className="pt-12 pb-8 flex flex-col items-center justify-center text-primary-300 space-y-4 opacity-50">
                                        <div className="w-1 h-1 rounded-full bg-primary-300"></div>
                                        <div className="w-1 h-1 rounded-full bg-primary-300"></div>
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
