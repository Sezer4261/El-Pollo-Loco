/**
 * Builds numbered animation frame images.
 * @param {string} basePath - Path prefix.
 * @param {number} start - First frame number.
 * @param {number} end - Last frame number.
 * @returns {HTMLImageElement[]} Frame images.
 */
function buildFrames(basePath, start, end) {
    const frames = [];
    for (let i = start; i <= end; i++) {
        const img = new Image();
        img.src = basePath + i + ".png";
        frames.push(img);
    }
    return frames;
}
