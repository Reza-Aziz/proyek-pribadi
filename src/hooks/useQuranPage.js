import { useState, useEffect } from 'react';
import { SURAH_DATA } from '../utils/quranData';

// Helper to load surah JSON
// Helper to load surah JSON
const loadSurah = async (number) => {
    try {
        const response = await fetch(`/quran-json/surah/${number}.json`);
        if (!response.ok) throw new Error('Failed to load');
        const raw = await response.json();
        const data = raw[number]; // Access by key "1", "2", etc.
        
        if (!data) return null;

        // Transform text object keys to array
        const ayahs = Object.entries(data.text).map(([k, v]) => ({
            number: parseInt(k),
            text: v
        })).sort((a, b) => a.number - b.number);

        return {
            ...data,
            number: parseInt(data.number),
            name: data.name,
            ayahs: ayahs
        };
    } catch (e) {
        console.error(e);
        return null;
    }
};

export function useQuranPage(startSurah, startAyah) {
    const [loading, setLoading] = useState(true);
    const [segments, setSegments] = useState([]); // [{ type: 'header', surah: 1 }, { type: 'ayah', surah: 1, number: 1, text: '...' }]
    const [nextStart, setNextStart] = useState(null); // { surah, ayah } for next page
    const [prevStart, setPrevStart] = useState(null); // { surah, ayah } for prev page

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            const PAGE_SIZE = 15;
            let resultSegments = [];
            
            let currentS = startSurah;
            let currentA = startAyah;
            let count = 0;

            try {
                // Load cache if needed or just fetch
                // We might need to load multiple surahs
                while (count < PAGE_SIZE) {
                    if (currentS > 114) break; // End of Quran

                    const surahData = await loadSurah(currentS);
                    
                    // Critical Fix: If surah fetch fails, stop to avoid infinite loop
                    if (!surahData) {
                        if (isMounted) {
                             // If completely failed on first try, maybe throw or break?
                             // But if we have some segments, we can show them?
                             // For now, break loop.
                             break;
                        }
                        return;
                    }
                    
                    if (!isMounted) return;

                    // Check if we need to insert header
                    if (currentA === 1) {
                        resultSegments.push({ type: 'header', surah: surahData.number, name: surahData.name });
                    }

                    const availableAyahs = surahData.ayahs.filter(a => a.number >= currentA);
                    
                    for (let ayah of availableAyahs) {
                        if (count >= PAGE_SIZE) break;
                        resultSegments.push({ 
                            type: 'ayah', 
                            surah: surahData.number, 
                            number: ayah.number, 
                            text: ayah.text 
                        });
                        count++;
                        currentA++;
                    }

                    if (count < PAGE_SIZE) {
                        // We finished this surah but need more ayahs
                        currentS++;
                        currentA = 1;
                    } else {
                        // We filled the page
                        // currentA is now at the next ayah (because we incremented after pushing)
                    }
                }

                if (isMounted) {
                    setSegments(resultSegments);
                    
                    // If no segments found (e.g. error loading), resultSegments is empty.
                    // UI should handle empty segments.
                    
                    // Calculate Next Start
                    if (currentS > 114) {
                        setNextStart(null);
                    } else {
                         setNextStart({ surah: currentS, ayah: currentA });
                    }

                    const prev = calculatePrevStart(startSurah, startAyah, PAGE_SIZE);
                    setPrevStart(prev);
                }
            } catch (err) {
                console.error("Error fetching Quran page:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [startSurah, startAyah]);

    return { loading, segments, nextStart, prevStart };
}

function calculatePrevStart(surah, ayah, amount) {
    let s = surah;
    let a = ayah;
    
    // Decrement 'amount' times
    for (let i = 0; i < amount; i++) {
        a--;
        if (a < 1) {
            s--;
            if (s < 1) return null; // Already at start
            // Get ayah count of previous surah
            const prevSurahData = SURAH_DATA.find(d => d.number === s);
            a = prevSurahData ? prevSurahData.ayahs : 1; // Fallback
        }
    }
    return { surah: s, ayah: a };
}
