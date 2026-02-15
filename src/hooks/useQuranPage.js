import { useState, useEffect } from 'react';
import { getPageInfo } from '../utils/pageMapper';

// Cache for fetched Surahs to avoid network redundancy
const surahCache = {};

const loadSurah = async (number) => {
    if (surahCache[number]) return surahCache[number];

    try {
        const response = await fetch(`/quran-json/surah/${number}.json`);
        if (!response.ok) throw new Error('Failed to load');
        const raw = await response.json();
        const data = raw[number]; 
        
        if (!data) return null;

        const ayahs = Object.entries(data.text).map(([k, v]) => ({
            number: parseInt(k),
            text: v
        })).sort((a, b) => a.number - b.number);

        const processed = {
            ...data,
            number: parseInt(data.number),
            name: data.name,
            ayahs: ayahs
        };
        
        surahCache[number] = processed;
        return processed;
    } catch (e) {
        console.error("Failed to fetch surah " + number, e);
        return null;
    }
};

export function useQuranPage(pageNumber) {
    const [loading, setLoading] = useState(true);
    const [segments, setSegments] = useState([]); 

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            setSegments([]);

            try {
                // Get Page Range
                const pageInfo = getPageInfo(pageNumber);
                if (!pageInfo) {
                    if (isMounted) setLoading(false);
                    return;
                }

                const { startSurah, startAyah, endSurah, endAyah } = pageInfo;
                
                let resultSegments = [];
                
                // Iterate from start Surah to end Surah
                for (let s = startSurah; s <= endSurah; s++) {
                    const surahData = await loadSurah(s);
                    if (!surahData) continue;
                    
                    // Determine range for this surah on this page
                    const sStart = (s === startSurah) ? startAyah : 1;
                    const sEnd = (s === endSurah) ? endAyah : surahData.ayahs.length;

                    // Add Header if:
                    // 1. It's the beginning of the Surah (Ayah 1)
                    // 2. AND we are showing from Ayah 1 on this page
                    if (sStart === 1) {
                        resultSegments.push({ 
                            type: 'header', 
                            surah: surahData.number, 
                            name: surahData.name 
                        });
                    }

                    // Filter Ayahs for this page
                    const pageAyahs = surahData.ayahs.filter(a => a.number >= sStart && a.number <= sEnd);
                    
                    pageAyahs.forEach(a => {
                        resultSegments.push({
                            type: 'ayah',
                            surah: surahData.number,
                            number: a.number,
                            text: a.text
                        });
                    });
                }
                
                if (isMounted) {
                    setSegments(resultSegments);
                }
            } catch (err) {
                console.error("Error fetching page:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [pageNumber]);

    return { loading, segments };
}
