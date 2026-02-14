import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { SURAH_DATA } from '../utils/quranData';
import { filterSurahs } from '../utils/stringUtils';
import { setCurrentPosition } from '../features/quran/quranSlice';

const SurahListPage = ({ onNavigate, onBack }) => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSurahs = filterSurahs(SURAH_DATA, searchQuery);

    const handleSurahClick = (surahNumber) => {
        dispatch(setCurrentPosition({ surah: surahNumber, page: 1, ayah: 1 })); // Keep for Redux consistency
        onNavigate('read', { surah: surahNumber, ayah: 1 });
    };

    return (
        <div className="min-h-screen bg-green-50 pb-24">
            {/* Header */}
            <div className="bg-green-600 text-white p-4 sticky top-0 z-10 shadow-md">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={onBack} className="text-2xl">←</button>
                    <h1 className="text-xl font-bold">Daftar Surat</h1>
                </div>
                
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Cari surat (misal: Kahfi, Yasin)..."
                    className="w-full p-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="p-4 grid gap-4 overflow-y-auto h-[calc(100vh-140px)] pb-20">
                {filteredSurahs.length > 0 ? (
                    filteredSurahs.map((surah) => (
                        <div 
                            key={surah.number}
                            onClick={() => handleSurahClick(surah.number)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-green-100 flex justify-between items-center active:scale-95 transition-transform cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                                    {surah.number}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{surah.name}</h3>
                                    <p className="text-xs text-gray-500">{surah.ayahs} Ayat</p>
                                </div>
                            </div>
                            <span className="text-2xl text-green-600">➜</span>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 mt-10">
                        <p>Surat tidak ditemukan.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SurahListPage;
