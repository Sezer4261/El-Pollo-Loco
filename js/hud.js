/**
 * Returns the visible health bar percentage from current HP.
 * Uses linear scaling so the first hit is visible immediately.
 * @param {number} current - Current health.
 * @param {number} max - Maximum health.
 * @returns {number} Bar fill percentage.
 */
function getHealthDisplayPercent(current, max) {
    if (current <= 0 || max <= 0) return 0;
    return Math.min(100, (current / max) * 100);
}


/**
 * Returns bar color based on fill percentage.
 * @param {number} percent - Fill percentage.
 * @returns {string} Bar color name.
 */
function getBarColor(percent) {
    if (percent > 60) return "green";
    if (percent > 30) return "orange";
    return "blue";
}


/**
 * Returns nearest bar level for percentage.
 * @param {number} percent - Fill percentage.
 * @returns {number} Bar level value.
 */
function getNearestBarLevel(percent) {
    let nearest = StatusBar.LEVELS[0];
    StatusBar.LEVELS.forEach((level) => {
        if (percent >= level - 10) nearest = level;
    });
    return nearest;
}


/**
 * Returns true when the endboss bar should be on screen.
 * @param {Endboss} endboss - Endboss instance.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 * @returns {boolean} True when visible on screen.
 */
function isEndbossBarOnScreen(endboss, cameraX, canvasWidth) {
    const screenX = endboss.x - cameraX;
    return screenX + endboss.width >= 0 && screenX <= canvasWidth;
}


/**
 * Positions the endboss health bar at the boss top-right corner.
 * @param {HTMLElement} container - Bar container element.
 * @param {Endboss} endboss - Endboss instance.
 * @param {number} cameraX - Camera X offset.
 * @param {number} canvasWidth - Canvas width.
 * @param {number} canvasHeight - Canvas height.
 */
function positionEndbossBarAtBoss(container, endboss, cameraX, canvasWidth, canvasHeight) {
    const screenX = endboss.x - cameraX;
    const leftPx = screenX + endboss.width - 136;
    const topPx = endboss.y + 8;
    container.style.left = Math.max(0, (leftPx / canvasWidth) * 100) + "%";
    container.style.top = Math.max(0, (topPx / canvasHeight) * 100) + "%";
}


function updateBarFillImage(fillImg, color) {
    if (!fillImg) return;
    fillImg.style.width = "";
    fillImg.src = StatusBar.FILL_PATHS[color] || StatusBar.FILL_PATHS.green;
}


/**
 * Updates HTML status bar images for all HUD elements.
 */
class StatusBar {
    healthElement;
    coinElement;
    bottleElement;
    endbossElement;
    endbossContainer;

    static LEVELS = [0, 20, 40, 60, 80, 100];
    static HEALTH_CRITICAL_HP = 20;
    static FILL_PATHS = {
        green: "img/7_statusbars/4_bar_elements/statusbar_green.png",
        orange: "img/7_statusbars/4_bar_elements/statusbar_orange.png",
        blue: "img/7_statusbars/4_bar_elements/statusbar_blue.png"
    };

    /**
     * Binds status bar DOM elements.
     */
    constructor() {
        this.healthElement = document.getElementById("healthBar");
        this.coinElement = document.getElementById("coinBar");
        this.bottleElement = document.getElementById("bottleBar");
        this.endbossElement = document.getElementById("endbossBar");
        this.endbossContainer = document.getElementById("endbossBarContainer");
    }


    /**
     * Updates the health bar image.
     * @param {number} current - Current health.
     * @param {number} max - Maximum health.
     */
    setHealth(current, max) {
        const percent = getHealthDisplayPercent(current, max);
        const critical = current > 0 && current <= StatusBar.HEALTH_CRITICAL_HP;
        this.setBarFill(this.healthElement, percent, critical ? "orange" : undefined);
        this.toggleHealthWarning(critical);
    }


    /**
     * Blinks the health bar red when health is critically low.
     * @param {boolean} active - Whether warning state is active.
     */
    toggleHealthWarning(active) {
        const bar = this.healthElement?.closest(".status-bar");
        if (!bar) return;
        bar.classList.toggle("status-bar--health-critical", active);
    }


    /**
     * Updates the coin bar image.
     * @param {number} percent - Coin bar percentage.
     */
    setCoins(percent) {
        this.setBarFill(this.coinElement, percent);
    }


    /**
     * Updates the bottle bar image.
     * @param {number} percent - Bottle bar percentage.
     */
    setBottles(percent) {
        this.setBarFill(this.bottleElement, percent);
    }


    /**
     * Updates the endboss bar in the fixed HUD.
     * @param {number} current - Boss health.
     * @param {number} max - Boss max health.
     * @param {boolean} visible - Whether bar is visible.
     * @param {boolean} [hitPulse=false] - Whether the hit pulse is active.
     */
    setEndboss(current, max, visible, hitPulse = false) {
        this.toggleEndbossVisibility(visible);
        this.endbossContainer?.classList.toggle("status-bar--endboss-hit", hitPulse);
        if (!visible) return;
        const percent = Math.max(0, (current / max) * 100);
        this.setBarFill(this.endbossElement, percent, getBarColor(percent));
    }


    /**
     * Shows or hides the endboss bar container.
     * @param {boolean} visible - Visibility flag.
     */
    toggleEndbossVisibility(visible) {
        this.endbossContainer?.classList.toggle("status-bar--hidden", !visible);
    }


    /**
     * Sets a bar fill width and color based on percentage.
     * @param {HTMLElement} el - Fill wrapper element.
     * @param {number} percent - Fill percentage.
     * @param {string} [colorOverride] - Optional color name.
     */
    setBarFill(el, percent, colorOverride) {
        if (!el) return;
        const clamped = Math.max(0, Math.min(100, percent));
        const color = colorOverride || getBarColor(clamped);
        el.style.width = clamped + "%";
        el.style.left = "0";
        updateBarFillImage(el.querySelector(".status-bar__fill-img"), color);
    }
}


/**
 * Shows a centered "+ bottle" reward popup on the game screen.
 */
class RewardPopup {
    hideTimer = null;

    /**
     * Binds the reward popup DOM element.
     */
    constructor() {
        this.element = document.getElementById("rewardPopup");
    }


    /**
     * Displays the bonus bottle popup with a short animation.
     */
    show() {
        if (!this.element) return;
        clearTimeout(this.hideTimer);
        this.element.classList.remove("reward-popup--hidden");
        this.element.classList.remove("reward-popup--animate");
        void this.element.offsetWidth;
        this.element.classList.add("reward-popup--animate");
        this.hideTimer = setTimeout(() => this.hide(), 1600);
    }


    /**
     * Hides the reward popup.
     */
    hide() {
        if (!this.element) return;
        this.element.classList.remove("reward-popup--animate");
        this.element.classList.add("reward-popup--hidden");
    }
}
