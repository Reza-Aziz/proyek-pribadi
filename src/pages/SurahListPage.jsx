import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { SURAH_DATA } from '../utils/quranData';
import { filterSurahs } from '../utils/stringUtils';
import { setCurrentPosition } from '../features/quran/quranSlice';
import { useDebounce } from '../hooks/useDebounce';

const SurahListPage = ({ onNavigate, onBack }) => {
    const useDispatchHook = useDispatch();
    const dispatch = useDispatchHook || (() => {}); 

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms debounce

    // Parse Search Query to separate Name and Ayah Number
    const { filteredSurahs, targetAyah } = useMemo(() => {
        let nameQuery = debouncedSearchQuery;
        let ayahQuery = null;

        // Regex to find "Name Number" pattern (e.g. "Kahfi 10", "Al Mulk 5")
        // Matches anything followed by space and digits at the end
        const match = debouncedSearchQuery.match(/^(.*?)\s+(\d+)$/);
        
        if (match) {
            nameQuery = match[1];
            ayahQuery = parseInt(match[2], 10);
        }

        const results = filterSurahs(SURAH_DATA, nameQuery);

        return { filteredSurahs: results, targetAyah: ayahQuery };
    }, [debouncedSearchQuery]);


    const handleSurahClick = (surah, targetAyahInput) => {
        let finalAyah = 1;
        if (targetAyahInput) {
            finalAyah = Math.min(Math.max(1, targetAyahInput), surah.ayahs);
        }

        dispatch(setCurrentPosition({ surah: surah.number, page: 1, ayah: finalAyah })); 
        onNavigate('read', { surah: surah.number, ayah: finalAyah });
    };

    return (
        <div className="h-screen flex flex-col bg-[#fdfaf5] relative overflow-hidden">
             {/* Decorative Background Pattern */}
             <div className="absolute inset-0 pointer-events-none opacity-5 z-0" 
                style={{ 
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #064e3b 1px, transparent 1px)', 
                    backgroundSize: '24px 24px' 
                }}
            ></div>

            {/* Header - Fixed at top via flex */}
            <div className="bg-primary-900 text-sand-50 p-6 pt-8 z-20 shadow-xl border-b border-sand-400/20 shrink-0">
                <div className="max-w-xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 active:scale-95 transition hover:bg-white/20">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <h1 className="text-2xl font-serif font-bold tracking-wide">Daftar Surat</h1>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-primary-300 group-focus-within:text-primary-100 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Cari surat... (contoh: Kahfi 10)"
                            className="w-full pl-11 pr-4 py-4 rounded-xl bg-primary-800/50 border border-primary-700 text-sand-50 placeholder-primary-400/70 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-primary-800 transition-all shadow-inner text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                         {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-primary-400 hover:text-sand-100"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>
                            </button>
                        )}
                    </div>
                    {/* Helper Text */}
                    <div className="mt-2 text-xs text-primary-300/80 px-1 font-medium flex justify-between h-5">
                       {/* Show 'Searching...' or Tips */}
                       {searchQuery !== debouncedSearchQuery ? (
                           <span className="animate-pulse text-sand-300">Mencari...</span>
                       ) : (
                           <>
                                <span>Tips: Ketik "NamaSurat NomorAyat"</span>
                                {targetAyah && <span className="text-sand-200 bg-primary-800 px-2 rounded-md">Loncat ke ayat {targetAyah}</span>}
                           </>
                       )}
                    </div>
                </div>
            </div>

            {/* List - Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 z-10 scroll-smooth">
                 <div className="max-w-xl mx-auto grid gap-3 pb-safe"> {/* pb-safe for mobile areas if needed, or just standard padding */}
                    {filteredSurahs.length > 0 ? (
                        filteredSurahs.map((surah) => {
                            const isValidAyah = targetAyah && targetAyah > 0 && targetAyah <= surah.ayahs;
                            
                            return (
                                <div 
                                    key={surah.number}
                                    onClick={() => handleSurahClick(surah, isValidAyah ? targetAyah : 1)}
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-sand-200 flex justify-between items-center active:scale-[0.98] transition-transform cursor-pointer hover:shadow-md hover:border-primary-200 group relative overflow-hidden shrink-0"
                                >
                                    {isValidAyah && (
                                        <div className="absolute right-0 top-0 bg-primary-100 text-primary-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-b border-l border-primary-200 shadow-sm z-10">
                                            Ke Ayat {targetAyah}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-5 relative z-0">
                                        <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
                                            <div className="absolute inset-0 bg-primary-50 rounded-md rotate-45 group-hover:rotate-90 transition-transform duration-500 border border-primary-100"></div>
                                            <div className="relative font-bold text-primary-900 font-serif text-lg z-10">
                                                {surah.number}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-primary-900 font-serif group-hover:text-primary-700 transition-colors">{surah.name}</h3>
                                            <div className="flex items-center gap-2 text-primary-400 mt-1">
                                                <span className="text-xs font-medium tracking-wide uppercase bg-sand-100 px-2 py-0.5 rounded text-primary-600">{surah.ayahs} Ayat</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 shrink-0">
                                        {isValidAyah && (
                                            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full animate-pulse mr-2">
                                                Ayat {targetAyah} ➜
                                            </span>
                                        )}
                                        <div className="text-primary-300 group-hover:text-primary-600 transition-colors transform group-hover:translate-x-1 duration-300">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                            <div className="bg-sand-200/50 p-6 rounded-full mb-4">
                                <svg className="w-12 h-12 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <p className="text-primary-800 font-serif text-xl mb-2">Surat tidak ditemukan</p>
                            <p className="text-primary-500 text-sm max-w-xs mx-auto">Coba kata kunci lain atau pastikan ejaan nama surat benar.</p>
                        </div>
                    )}
                    
                    {/* Bottom Spacer/Loading buffer */}
                    <div className="h-8"></div>
                 </div>
            </div>
        </div>
    );
};

export default SurahListPage;
