import { SURAH_DATA } from './quranData';
import { JUZ_STARTS } from './juzData';

// Constants
const PAGES_PER_JUZ = 20;

// Initialize Page Mapping
// format: [ { pageNumber, juz, startSurah, startAyah, endSurah, endAyah } ]
let PAGE_MAPPING = [];
let CUMULATIVE_AYAHS = [];

const initCumulative = () => {
    if (CUMULATIVE_AYAHS.length > 0) return;
    let sum = 0;
    CUMULATIVE_AYAHS.push(0); // Surah 0 doesn't exist placeholder
    SURAH_DATA.forEach(s => {
        sum += s.ayahs;
        CUMULATIVE_AYAHS.push(sum);
    });
};

export const toGlobalIndex = (surah, ayah) => {
    initCumulative();
    if (surah < 1 || surah > 114) return -1;
    return CUMULATIVE_AYAHS[surah - 1] + ayah;
};

export const fromGlobalIndex = (globalIndex) => {
    initCumulative();
    for (let i = 1; i <= 114; i++) {
        if (globalIndex <= CUMULATIVE_AYAHS[i]) {
            return {
                surah: i,
                ayah: globalIndex - CUMULATIVE_AYAHS[i - 1]
            };
        }
    }
    // Fallback end of Quran
    return { surah: 114, ayah: 6 }; 
};


const initPageMapping = () => {
    if (PAGE_MAPPING.length > 0) return;
    initCumulative();

    // We iterate through 30 Juz
    for (let j = 0; j < 30; j++) {
        const juzNum = j + 1;
        const start = JUZ_STARTS[j];
        const end = JUZ_STARTS[j+1] 
            ? { surah: JUZ_STARTS[j+1].surah, ayah: JUZ_STARTS[j+1].ayah } 
            : { surah: 114, ayah: 6 }; // End of Quran

        // Calculate global indices for this Juz
        const startGlobal = toGlobalIndex(start.surah, start.ayah);
        let endGlobal = toGlobalIndex(end.surah, end.ayah) - 1;
        
        // Fix for last juz to include the final ayah
        if (juzNum === 30) endGlobal = toGlobalIndex(114, 6);

        const totalAyahsInJuz = endGlobal - startGlobal + 1;
        const ayahsPerPage = totalAyahsInJuz / PAGES_PER_JUZ;

        // Distribute pages for this Juz
        for (let p = 0; p < PAGES_PER_JUZ; p++) {
             // Range of this page relative to Juz start
             const pStartOffset = Math.floor(p * ayahsPerPage);
             const pEndOffset = Math.floor((p + 1) * ayahsPerPage) - 1;
             
             // Global range for this page
             const pageStartGlobal = startGlobal + pStartOffset;
             let pageEndGlobal = startGlobal + pEndOffset;
             
             // Ensure the last page of Juz covers up to the end of Juz
             if (p === PAGES_PER_JUZ - 1) {
                 pageEndGlobal = endGlobal;
             }

             // Convert back to Surah:Ayah
             const startLoc = fromGlobalIndex(pageStartGlobal);
             const endLoc = fromGlobalIndex(pageEndGlobal);
             
             const pageNum = (j * PAGES_PER_JUZ) + (p + 1);
             
             PAGE_MAPPING.push({
                 pageNumber: pageNum,
                 juz: juzNum,
                 startSurah: startLoc.surah,
                 startAyah: startLoc.ayah,
                 endSurah: endLoc.surah,
                 endAyah: endLoc.ayah
             });
        }
    }
};

// Ensure initialization using side-effect module loading or explicit call
initPageMapping();

export const getPageInfo = (pageNumber) => {
    if (!PAGE_MAPPING.length) initPageMapping();
    if (pageNumber < 1) return PAGE_MAPPING[0];
    if (pageNumber > 600) return PAGE_MAPPING[599]; // Max 600
    return PAGE_MAPPING[pageNumber - 1];
};

export const getPageFromAyah = (surah, ayah) => {
    if (!PAGE_MAPPING.length) initPageMapping();
    const targetGlobal = toGlobalIndex(parseInt(surah), parseInt(ayah));
    
    // Binary search or linear? Linear is fine for 600 items.
    for (let i = 0; i < PAGE_MAPPING.length; i++) {
        const p = PAGE_MAPPING[i];
        const pStart = toGlobalIndex(p.startSurah, p.startAyah);
        const pEnd = toGlobalIndex(p.endSurah, p.endAyah);
        
        if (targetGlobal >= pStart && targetGlobal <= pEnd) {
            return p.pageNumber;
        }
    }
    return 1;
};
