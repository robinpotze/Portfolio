/**
 * Average perceived brightness (0–1) of an image, sampled on a small canvas.
 * Returns 0 when the image can't be read (not loaded yet, or cross-origin).
 */
export function averageLuminance(image, sampleSize = 16) {
    if (!image?.width || !image?.height) {
        return 0;
    }

    try {
        const canvas = document.createElement('canvas');
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(image, 0, 0, sampleSize, sampleSize);
        const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);

        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
            total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        return total / (data.length / 4) / 255;
    } catch {
        return 0;
    }
}
