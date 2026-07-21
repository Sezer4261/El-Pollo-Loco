/**
 * Starts the jump sprite sequence from the first frame.
 */
Character.prototype.beginJumpAnimation = function () {
    const now = performance.now();
    this.lastAnimTime = now;
    this.frameIndex = 0;
    const jumpFrames = this.frameLists.jump;
    if (jumpFrames?.length) this.img = jumpFrames[0];
};

/**
 * Switches the current animation state.
 * @param {string} state - State name.
 */
Character.prototype.setState = function (state) {
    if (this.isDead && state !== "dead") return;
    if (this.currentState === state) return;
    this.currentState = state;
    this.frameIndex = 0;
    if (state === "jump") this.beginJumpAnimation();
};

/**
 * Advances the current animation based on elapsed time.
 * @param {number} now - Current timestamp.
 */
Character.prototype.updateAnimation = function (now) {
    if (this.currentState === "jump") return this.updateJumpFrame(now);
    const speed = this.animationSpeeds[this.currentState] || 120;
    if (now - this.lastAnimTime < speed) return;
    this.advanceAnimationFrame();
    this.lastAnimTime = now;
};

/**
 * Plays jump frames in order over the jump duration.
 * @param {number} now - Current timestamp.
 */
Character.prototype.updateJumpFrame = function (now) {
    const frames = this.frameLists.jump;
    if (!frames?.length || now - this.lastAnimTime < CHARACTER_JUMP_FRAME_MS) return;
    if (this.frameIndex < frames.length - 1) {
        this.frameIndex++;
        this.img = frames[this.frameIndex];
    }
    this.lastAnimTime = now;
};

/**
 * Moves to the next animation frame for the current state.
 */
Character.prototype.advanceAnimationFrame = function () {
    const frames = this.frameLists[this.currentState];
    if (!frames?.length) return;
    if (this.currentState === "dead" && this.frameIndex >= frames.length - 1) return;
    this.frameIndex = this.getNextFrameIndex(frames.length);
    this.img = frames[this.frameIndex];
};

/**
 * Returns the next frame index for the active animation.
 * @param {number} frameCount - Number of frames.
 * @returns {number} Next frame index.
 */
Character.prototype.getNextFrameIndex = function (frameCount) {
    if (this.currentState === "dead") return Math.min(this.frameIndex + 1, frameCount - 1);
    return (this.frameIndex + 1) % frameCount;
};
