import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentPosition } from '../features/quran/quranSlice';
import { SURAH_DATA } from '../utils/quranData';

export default function SearchModal({ onClose, onNavigate }) {
    const [query, setQuery] = useState('');
    const dispatch = useDispatch();

    const handleSearch = (e) => {
        e.preventDefault();
        const input = query.trim().toLowerCase();
        
        // Pattern 1: "Surah:Ayat" e.g. "2:255"
        const colonMatch = input.match(/^(\d+):(\d+)$/);
        if (colonMatch) {
            const s = parseInt(colonMatch[1]);
            const a = parseInt(colonMatch[2]);
            if (s >= 1 && s <= 114) {
                // Validate ayah count
                const surahMeta = SURAH_DATA.find(d => d.number === s);
                if (surahMeta && a <= surahMeta.ayahs) {
                    dispatch(setCurrentPosition({ surah: s, page: 1 })); // "Page" in strict sense is not used, we use ayah index
                    // Logic in QuranReader uses 'lastRead' or passed props?
                    // QuranReader uses 'lastRead' from store.
                    // But we want to jump to specific Ayah.
                    // So we should dispatch setLastRead({ surah: s, ayah: a }).
                    // Or better, dispatch a specific action or pass params.
                    // Let's use setLastRead for simplicity as it updates the view.
                    
                    // Actually, QuranReader uses `useState(lastRead)` on mount.
                    // If we change Redux state, QuranReader won't update if it strictly uses local state.
                    // We need QuranReader to listen to Redux or remount.
                    // In Dashboard, clicking "Baca" mounts Reader.
                    // If we are already in Reader? Modal is likely overlay.
                    // If we are in Dashboard -> Search -> Jump -> Mount Reader with new coords.
                }
            }
        }
        
        // Pattern 2: Surah Number only "18"
        const numMatch = input.match(/^(\d+)$/);
        if (numMatch) {
             const s = parseInt(numMatch[1]);
             if (s >= 1 && s <= 114) {
                 onGoTo(s, 1);
                 return;
             }
        }

        // Pattern 3: Surah Name "Kahf"
        const nameMatch = SURAH_DATA.find(s => s.name.toLowerCase().includes(input));
        if (nameMatch) {
            onGoTo(nameMatch.number, 1);
            return;
        }

        // Parse complex logic...
        // Fallback: Parse "2:255"
        if (input.includes(':')) {
           const [sStr, aStr] = input.split(':');
           const s = parseInt(sStr);
           const a = parseInt(aStr);
           if (!isNaN(s) && !isNaN(a)) {
                onGoTo(s, a);
                return;
           }
        }
        
        alert("Pencarian tidak ditemukan. Coba '2:255' atau 'Kahf'");
    };

    const onGoTo = (s, a) => {
        // Dispatch to update Redux (persistence)
        dispatch(setCurrentPosition({ surah: s, ayah: a, page: 1 }));
        // Navigate with params to force Reader to update
        onNavigate('read', { surah: s, ayah: a });
        onClose();
    };
    
    // Fix: Dynamic import in handler is weird. I imported regular above.
    // 'setCurrentPosition' isn't used by Reader state initialization?
    // Reader: `const [position, setPosition] = useState(lastRead || ...)`
    // If I change Redux `lastRead`, `position` doesn't change unless I `useEffect`.
    // I added `useEffect` in Reader to *save* position to Redux.
    // Syncing Redux -> Local is tricky if strictly 2-way.
    // Best way: Dashboard -> onNavigate('read') -> mounts Reader. Reader reads Redux.
    // If Search is in Dashboard, it sets Redux, then Navigates. Reader mounts, reads new Redux. Works.
    // If Search is inside Reader? Reader needs to listen.
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
            <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-800">Cari Surah / Ayat</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500">✕</button>
                </div>
                
                <form onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        placeholder="Contoh: 18 atau 2:255 atau Kahf"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-green-500 outline-none font-medium"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition">
                        Cari / Lompat
                    </button>
                </form>
                
                <div className="mt-4 text-xs text-gray-500">
                    Tips: Ketik nomer surah (1-114) atau format S:A (2:255).
                </div>
            </div>
        </div>
    );
}
