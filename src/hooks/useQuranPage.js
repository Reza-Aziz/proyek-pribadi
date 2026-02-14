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

            // Load cache if needed or just fetch
            // We might need to load multiple surahs
            while (count < PAGE_SIZE) {
                if (currentS > 114) break; // End of Quran

                const surahData = await loadSurah(currentS);
                if (!surahData || !isMounted) return;

                // Check if we need to insert header
                if (currentA === 1) {
                    resultSegments.push({ type: 'header', surah: surahData.number, name: surahData.name });
                }

                // Get ayahs from current surah starting at currentA
                // surahData.ayahs should be array. Filter? Or just index.
                // Assuming json format: { number: 1, name: "...", ayahs: [{ number: 1, text: "..." }] }
                // Array index is number - 1 ?? usually API is 1-based number, array 0-based.
                
                // Let's verify JSON structure from user prompt:
                // "ayahs": [ { "number": 1, "text": "..." } ]
                // It seems sorted.
                
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
                
                // Calculate Next Start
                if (currentS > 114) {
                    setNextStart(null);
                } else {
                    // If we finished a surah exactly, next is NextSurah:1
                    // If we are mid surah, next is CurrentSurah:CurrentAyah
                    // Logic above:
                    // If loop broke because count == PAGE_SIZE:
                    // currentA is one step ahead of last pushed.
                    // If loop broke because end of availableAyahs (and fetch next loop):
                    // It handles logic.
                    // Wait, if we exactly finished Surah 1 (7 ayahs).
                    // We load Surah 2.
                    // If we finish page exactly at end of Surah 1? (e.g. page size 7)
                    // Then next iteration starts Surah 2.
                    
                    // Simple logic:
                    // Next page starts at currentS, currentA (calculated after loop)
                     setNextStart({ surah: currentS, ayah: currentA });
                }

                // Calculate Prev Start (Rough approximation or strict?)
                // Strict reverse calculation is complex.
                // Simple: "Go back 15 ayahs".
                // We can use a helper function to subtract 15 from (startSurah, startAyah).
                const prev = calculatePrevStart(startSurah, startAyah, PAGE_SIZE);
                setPrevStart(prev);

                setLoading(false);
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
