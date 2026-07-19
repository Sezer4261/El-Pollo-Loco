/**
 * Builds numbered animation frame images.
 * @param {string} basePath - Path prefix.
 * @param {number} start - First frame number.
 * @param {number} end - Last frame number.
 * @returns {HTMLImageElement[]} Frame images.
 */
function buildFrames(basePath, start, end) {
    const frames = [];
    for (let index = start; index <= end; index++) {
        const img = new Image();
        img.src = basePath + index + ".png";
        frames.push(img);
    }
    return frames;
}
