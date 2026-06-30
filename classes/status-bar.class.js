/**
 * Updates HTML status bar images for all HUD elements.
 */
class StatusBar {
    healthElement;
    coinElement;
    bottleElement;
    endbossElement;
    endbossContainer;

    static BAR_PATHS = {
        health: "img/7_statusbars/1_statusbar/2_statusbar_health/",
        coin: "img/7_statusbars/1_statusbar/1_statusbar_coin/",
        bottle: "img/7_statusbars/1_statusbar/3_statusbar_bottle/"
    };

    static LEVELS = [0, 20, 40, 60, 80, 100];

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
        this.setBarImage(this.healthElement, "health", percent);
    }


    /**
     * Updates the coin bar image.
     * @param {number} percent - Coin bar percentage.
     */
    setCoins(percent) {
        this.setBarImage(this.coinElement, "coin", percent);
    }


    /**
     * Updates the bottle bar image.
     * @param {number} percent - Bottle bar percentage.
     */
    setBottles(percent) {
        this.setBarImage(this.bottleElement, "bottle", percent);
    }


    /**
     * Updates the endboss bar image.
     * @param {number} current - Boss health.
     * @param {number} max - Boss max health.
     * @param {boolean} visible - Whether bar is visible.
     */
    setEndboss(current, max, visible) {
        this.toggleEndbossVisibility(visible);
        const percent = Math.max(0, (current / max) * 100);
        const level = getNearestBarLevel(percent);
        const color = getBarColor(percent);
        this.endbossElement.src = "img/7_statusbars/2_statusbar_endboss/" + color + "/" + color + level + ".png";
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
     * Sets a bar image based on percentage.
     * @param {HTMLImageElement} el - Image element.
     * @param {string} type - Bar type key.
     * @param {number} percent - Fill percentage.
     */
    setBarImage(el, type, percent) {
        const level = getNearestBarLevel(percent);
        const color = getBarColor(percent);
        el.src = StatusBar.BAR_PATHS[type] + color + "/" + level + ".png";
    }

}
