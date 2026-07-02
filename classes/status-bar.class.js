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
        const percent = Math.max(0, (current / max) * 100);
        this.setBarFill(this.healthElement, percent);
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
     */
    setEndboss(current, max, visible) {
        this.toggleEndbossVisibility(visible);
        if (!visible) return;
        const percent = Math.max(0, (current / max) * 100);
        this.setBarFill(this.endbossElement, percent, getBarColor(percent));
    }


    /**
     * Shows or hides the endboss bar container.
     * @param {boolean} visible - Visibility flag.
     */
    toggleEndbossVisibility(visible) {
        if (!this.endbossContainer) return;
        this.endbossContainer.classList.toggle("status-bar--hidden", !visible);
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
        const fillImg = el.querySelector(".status-bar__fill-img");
        if (fillImg) fillImg.src = StatusBar.FILL_PATHS[color] || StatusBar.FILL_PATHS.green;
    }

}
