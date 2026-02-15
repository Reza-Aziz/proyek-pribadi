import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuranPage } from '../hooks/useQuranPage';
import { setLastRead, setBookmark, removeBookmark } from '../features/quran/quranSlice';
import { addLog } from '../features/logs/logSlice';
import { SURAH_DATA } from '../utils/quranData';
import { getPageFromAyah, getPageInfo } from '../utils/pageMapper'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Copy, CheckCircle } from 'lucide-react';

export default function QuranReader({ onBack, params }) {
    const dispatch = useDispatch();
    const { lastRead, bookmarks } = useSelector(state => state.quran);
    
    // Initialize Page
    const [page, setPage] = useState(() => {
        if (params && params.surah) {
            return getPageFromAyah(params.surah, params.ayah || 1);
        }
        if (lastRead && lastRead.page) return lastRead.page;
        return 1;
    });

    const [direction, setDirection] = useState(0);
    const [highlightedAyah, setHighlightedAyah] = useState(null); 
    const [selectedAyah, setSelectedAyah] = useState(null); // { surah, number, text }

    // Session Progress Tracking
    const [sessionPages, setSessionPages] = useState(0);
    const [toastMessage, setToastMessage] = useState(null);
    const [showAchievement, setShowAchievement] = useState(false);
    const lastPageRef = useRef(page);

    // Sync Page with Params (Search Navigation)
    useEffect(() => {
        if (params && params.surah) {
            const targetPage = getPageFromAyah(params.surah, params.ayah || 1);
            if (targetPage !== page) {
                setDirection(targetPage > page ? 1 : -1);
                setPage(targetPage);
                lastPageRef.current = targetPage; 
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]); 

    // Reading Progress Logic
    useEffect(() => {
        if (page > lastPageRef.current) {
            const newCount = sessionPages + 1;
            setSessionPages(newCount);

            if (newCount === 5) {
                setToastMessage("Semangat sudah 1/4 Juz! 🚀");
                setTimeout(() => setToastMessage(null), 3000);
            } else if (newCount === 10) {
                setToastMessage("Yey sudah setengah Juz, Semangatt! ✨");
                setTimeout(() => setToastMessage(null), 3000);
            } else if (newCount === 15) {
                setToastMessage("Dikit lagi... 🔥");
                setTimeout(() => setToastMessage(null), 3000);
            } else if (newCount === 20) {
                setShowAchievement(true);
                setSessionPages(0); 
            }
        }
        lastPageRef.current = page;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);


    const { loading, segments } = useQuranPage(page);
    const pageInfo = getPageInfo(page);
    const containerRef = useRef(null);

    // Auto-Scroll and Highlight Logic
    useEffect(() => {
        if (!loading && params && params.surah && params.ayah) {
            const targetId = `ayah-${params.surah}-${params.ayah}`;
            const element = document.getElementById(targetId);
            
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setHighlightedAyah({ surah: parseInt(params.surah), ayah: parseInt(params.ayah) });
                    const timer = setTimeout(() => {
                        setHighlightedAyah(null);
                    }, 2500); 
                    return () => clearTimeout(timer);
                }, 500); 
            }
        }
    }, [loading, params, page]); 

    // Scroll to Top
    useEffect(() => {
        if (containerRef.current && !loading && (!params || !params.ayah)) {
             containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [page, loading, params]);

    // Logging Logic State
    const sessionInitRef = useRef(false);
    const [trackingState, setTrackingState] = useState(null); // { surah, startAyah }

    // Init Session Start on Mount (Capture previous LastRead)
    useEffect(() => {
        if (!sessionInitRef.current) {
            sessionInitRef.current = true;
            if (lastRead) {
                setTrackingState({ surah: lastRead.surah, startAyah: lastRead.ayah });
            } else {
                setTrackingState({ surah: 1, startAyah: 1 });
            }
        }
    }, [lastRead]); 

    // Track Progress & Save Log
    useEffect(() => {
        if (!segments.length || !trackingState) return;

        // Simplified Session Logging:
        // Always log from Session Start (trackingState) -> Current Page End.
        // This creates ONE log entry that expands as we read, even if we jump 2->90.
        
        const lastSegment = segments[segments.length - 1]; // "Terakhir dibaca akhir"
        const currentEnd = { surah: lastSegment.surah, ayat: lastSegment.number };
        const today = new Date().toISOString().split('T')[0];

        // Dispatch Log with Session Structure
        dispatch(addLog({
            date: today,
            start: { surah: trackingState.surah, ayat: trackingState.startAyah },
            end: currentEnd
        }));
        
        // We do NOT update trackingState here. 
        // It stays fixed at where we passed "Session Start" (lastRead at mount).

    }, [segments, trackingState, dispatch]);


    // Save Last Read (Auto)
    useEffect(() => {
        if (pageInfo) {
            dispatch(setLastRead({ 
                surah: pageInfo.startSurah, 
                ayah: pageInfo.startAyah, 
                page: page 
            }));
        }
    }, [page, dispatch, pageInfo]);


    // Action Handlers
    const isBookmarked = (surah, ayah) => {
        const id = `${surah}-${ayah}`;
        return bookmarks.some(b => b.id === id);
    };

    const toggleBookmark = () => {
        if (!selectedAyah) return;
        const id = `${selectedAyah.surah}-${selectedAyah.number}`;
        
        if (isBookmarked(selectedAyah.surah, selectedAyah.number)) {
            dispatch(removeBookmark(id));
            setToastMessage("Bookmark dihapus");
        } else {
            dispatch(setBookmark({
                id,
                surah: selectedAyah.surah,
                ayah: selectedAyah.number,
                date: new Date().toISOString()
            }));
            setToastMessage("Ditambahkan ke Bookmark");
        }
        setTimeout(() => setToastMessage(null), 2000);
        setSelectedAyah(null);
    };

    const copyText = () => {
        if (!selectedAyah) return;
        navigator.clipboard.writeText(selectedAyah.text);
        setToastMessage("Ayat disalin");
        setTimeout(() => setToastMessage(null), 2000);
        setSelectedAyah(null);
    };
    
    const setManualLastRead = () => {
         if (!selectedAyah) return;
         dispatch(setLastRead({ 
            surah: selectedAyah.surah, 
            ayah: selectedAyah.number, 
            page: page 
        }));
        setToastMessage("Ditandai terakhir dibaca");
        setTimeout(() => setToastMessage(null), 2000);
        setSelectedAyah(null);
    };


    // Overscroll Logic
    const [touchStart, setTouchStart] = useState(null);
    const [pullDelta, setPullDelta] = useState(0);
    const PULL_THRESHOLD = 100;

    const handleTouchStart = (e) => setTouchStart(e.touches[0].clientY);
    
    const handleTouchMove = (e) => {
        if (!touchStart) return;
        const currentY = e.touches[0].clientY;
        const delta = currentY - touchStart;
        const container = containerRef.current;
        if (!container) return;

        if (container.scrollTop === 0 && delta > 0) setPullDelta(delta);
        else if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5 && delta < 0) setPullDelta(delta);
        else setPullDelta(0);
    };

    const handleTouchEnd = () => {
        if (pullDelta > PULL_THRESHOLD && page > 1) {
            setDirection(-1);
            setPage(p => p - 1);
        } else if (pullDelta < -PULL_THRESHOLD && page < 600) {
            setDirection(1);
            setPage(p => p + 1);
        }
        setTouchStart(null);
        setPullDelta(0);
    };

    const pageVariants = {
        enter: (d) => ({ y: d > 0 ? 50 : -50, opacity: 0 }),
        center: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
        exit: (d) => ({ y: d > 0 ? -50 : 50, opacity: 0, transition: { duration: 0.2 } })
    };

    return (
        <div className="flex flex-col h-full bg-[#fdfaf5] relative overflow-hidden">
            {/* Header */}
            <div className="bg-primary-900 text-sand-50 p-4 pt-8 shrink-0 flex justify-between items-center z-20 shadow-md border-b border-sand-400 relative">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-sand-400 to-transparent opacity-50"></div>
                <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 active:scale-95 transition hover:bg-white/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                
                <div className="text-center">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-sand-300 mb-1 font-sans">Juz {pageInfo?.juz || '-'}</div>
                    <div className="font-serif text-lg font-bold text-sand-50 tracking-wide drop-shadow-md truncate max-w-[200px]">
                       {segments[0] ? SURAH_DATA.find(s => s.number === segments[0].surah)?.name : ""}
                    </div>
                </div>
                <div className="w-10"></div> 
            </div>

            {/* TOAST NOTIFICATION */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="absolute top-24 left-0 right-0 z-50 flex justify-center pointer-events-none"
                    >
                        <div className="bg-primary-900/90 backdrop-blur-md text-sand-50 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border border-sand-400/30">
                            <span className="text-sm font-bold tracking-wide">{toastMessage}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ACHIEVEMENT POPUP */}
            <AnimatePresence>
                {showAchievement && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-sand-200 text-center relative overflow-hidden"
                        >
                             <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"></div>
                             <div className="mb-6 inline-flex p-4 rounded-full bg-sand-100 text-primary-600 ring-4 ring-sand-50">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                             </div>
                             <h3 className="text-2xl font-serif font-bold text-primary-900 mb-2">Alhamdulillah!</h3>
                             <p className="text-primary-600 mb-6">Selamat! Kamu sudah membaca 1 Juz hari ini.</p>
                             <button 
                                onClick={() => setShowAchievement(false)}
                                className="w-full py-3 bg-primary-900 text-sand-50 rounded-xl font-bold tracking-wide shadow-lg active:scale-95 transition hover:bg-primary-800"
                             >
                                Lanjut Membaca
                             </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            {/* AYAH ACTION MENU (BOTTOM SHEET) */}
            <AnimatePresence>
                {selectedAyah && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-primary-900/40 z-40 backdrop-blur-[2px]"
                            onClick={() => setSelectedAyah(null)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1)] border-t border-sand-200 p-6 pb-8"
                        >
                            <div className="w-12 h-1 bg-sand-300 rounded-full mx-auto mb-6 opacity-50"></div>
                            
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h4 className="font-serif font-bold text-primary-900 text-xl">
                                        Surah {SURAH_DATA.find(s => s.number === selectedAyah.surah)?.name}
                                    </h4>
                                    <p className="text-primary-500 font-medium">Ayat {selectedAyah.number}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-sand-100 flex items-center justify-center text-primary-700 font-bold border border-sand-200 shadow-sm">
                                    {selectedAyah.number}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <button 
                                    onClick={toggleBookmark}
                                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-sand-50 hover:bg-sand-100 transition border border-sand-100"
                                >
                                    <div className={`p-3 rounded-full ${isBookmarked(selectedAyah.surah, selectedAyah.number) ? 'bg-primary-900 text-sand-50 shadow-md' : 'bg-primary-100 text-primary-700'}`}>
                                        <Bookmark size={24} fill={isBookmarked(selectedAyah.surah, selectedAyah.number) ? "currentColor" : "none"} />
                                    </div>
                                    <span className="text-xs font-bold text-primary-800">Bookmark</span>
                                </button>

                                <button 
                                    onClick={setManualLastRead}
                                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-sand-50 hover:bg-sand-100 transition border border-sand-100"
                                >
                                    <div className="p-3 rounded-full bg-primary-100 text-primary-700">
                                        <CheckCircle size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-primary-800">Terakhir Baca</span>
                                </button>
                                
                                <button 
                                    onClick={copyText}
                                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-sand-50 hover:bg-sand-100 transition border border-sand-100"
                                >
                                    <div className="p-3 rounded-full bg-primary-100 text-primary-700">
                                        <Copy size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-primary-800">Salin</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>


            {/* Page Number Indicator (Bottom Fixed) */}
             <div className="absolute bottom-6 left-0 right-0 z-30 pointer-events-none flex justify-center">
                <div className="bg-primary-900/10 backdrop-blur-sm text-primary-900 px-4 py-1 rounded-full font-serif font-bold shadow-sm border border-primary-900/20 text-sm">
                    {page}
                </div>
            </div>

            {/* Pull Indicators */}
            <AnimatePresence>
                {Math.abs(pullDelta) > 50 && (
                    <motion.div 
                        initial={{ opacity: 0, y: pullDelta > 0 ? -20 : 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`absolute left-0 right-0 z-20 flex justify-center items-center pointer-events-none ${pullDelta > 0 ? 'top-20' : 'bottom-20'}`}
                    >
                        <div className="bg-primary-900/95 text-sand-50 px-6 py-3 rounded-full shadow-lg text-sm font-bold tracking-wide flex items-center gap-3">
                             <span>
                                {pullDelta > 0 
                                    ? (page > 1 ? "Lepas: Halaman Sebelumnya" : "Awal Mushaf")
                                    : (page < 600 ? "Lepas: Halaman Selanjutnya" : "Akhir Mushaf")}
                             </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Content */}
            <div 
                ref={containerRef}
                className="flex-1 overflow-y-auto p-0 relative bg-[#fdfaf5] scroll-smooth" 
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="min-h-full max-w-2xl mx-auto relative z-10 pb-20 pt-4 px-4">
                    <AnimatePresence initial={false} custom={direction} mode='popLayout'>
                        <motion.div
                            key={page}
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
                                <div className="text-center p-8 text-primary-900">Data Kosong</div>
                            ) : (
                                <div>
                                    {segments.map((seg, idx) => {
                                        if (seg.type === 'header') {
                                            return (
                                                <div key={`head-${idx}`} className="py-8 text-center relative mb-4">
                                                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-primary-200 -z-10"></div>
                                                    <span className="bg-[#fdfaf5] px-4 text-primary-900 font-serif font-bold text-xl drop-shadow-sm border border-primary-200 ml-auto mr-auto inline-block py-2 rounded-lg shadow-sm">
                                                        Surah {seg.name}
                                                    </span>
                                                    <div className="mt-4 font-serif text-2xl text-primary-900 opacity-80">﷽</div>
                                                </div>
                                            )
                                        }

                                        const ayahId = `ayah-${seg.surah}-${seg.number}`;
                                        const isHighlight = highlightedAyah && highlightedAyah.surah === seg.surah && highlightedAyah.ayah === seg.number;
                                        
                                        // Is this ayah selected currently?
                                        const isSelected = selectedAyah && selectedAyah.surah === seg.surah && selectedAyah.number === seg.number;

                                        return (
                                            <div 
                                                key={ayahId} 
                                                id={ayahId}
                                                // Added onClick handler here
                                                onClick={() => setSelectedAyah({ surah: seg.surah, number: seg.number, text: seg.text })}
                                                className={`relative flex flex-row-reverse items-start gap-3 py-2 border-b border-sand-200/40 transition-colors duration-200 cursor-pointer 
                                                    ${isSelected ? 'bg-sand-200/50' : ''}`}
                                            >
                                                <AnimatePresence>
                                                    {isHighlight && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ 
                                                                duration: 0.8, 
                                                                ease: "easeOut",
                                                                exit: { duration: 2.5, ease: "easeInOut" } 
                                                            }}
                                                            className="absolute inset-0 bg-primary-100/60 rounded-lg -z-10"
                                                        />
                                                    )}
                                                </AnimatePresence>

                                                <p className="font-arabic text-primary-900 flex-1 text-right leading-[2.4] px-2 text-2xl relative z-10" dir="rtl">
                                                    {seg.text}
                                                </p>
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold mt-2 relative z-10 transition-colors
                                                    ${isBookmarked(seg.surah, seg.number) 
                                                        ? 'bg-primary-900 text-sand-50 border-primary-900' 
                                                        : 'bg-sand-100/30 text-primary-400 border-sand-300/50'}`}
                                                >
                                                    {seg.number}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
