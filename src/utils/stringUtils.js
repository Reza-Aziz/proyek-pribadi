export const levenshteinDistance = (a, b) => {
    const matrix = [];
    let i, j;

    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

export const filterSurahs = (surahs, query) => {
    if (!query) return surahs;
    
    const lowerQuery = query.toLowerCase();
    
    return surahs.map(surah => {
        // Direct match priority
        const nameLower = surah.name.toLowerCase();
        if (nameLower.includes(lowerQuery) || surah.number.toString().includes(lowerQuery)) {
            return { ...surah, distance: 0 };
        }
        
        // Fuzzy match
        const distance = levenshteinDistance(nameLower, lowerQuery);
        return { ...surah, distance };
    })
    .filter(s => s.distance <= 3) // Tolerance of 3 characters
    .sort((a, b) => a.distance - b.distance);
};
