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
        if (this.endbossContainer) {
            this.endbossContainer.classList.toggle("status-bar--hidden", !visible);
        }
        const percent = Math.max(0, (current / max) * 100);
        const level = this.getNearestLevel(percent);
        const color = percent > 60 ? "green" : percent > 30 ? "orange" : "blue";
        this.endbossElement.src = "img/7_statusbars/2_statusbar_endboss/" + color + "/" + color + level + ".png";
    }


    /**
     * Sets a bar image based on percentage.
     * @param {HTMLImageElement} el - Image element.
     * @param {string} type - Bar type key.
     * @param {number} percent - Fill percentage.
     */
    setBarImage(el, type, percent) {
        const level = this.getNearestLevel(percent);
        const color = percent > 60 ? "green" : percent > 30 ? "orange" : "blue";
        el.src = StatusBar.BAR_PATHS[type] + color + "/" + level + ".png";
    }


    /**
     * Returns nearest bar level for percentage.
     * @param {number} percent - Fill percentage.
     * @returns {number} Bar level value.
     */
    getNearestLevel(percent) {
        let nearest = StatusBar.LEVELS[0];
        StatusBar.LEVELS.forEach((level) => {
            if (percent >= level - 10) nearest = level;
        });
        return nearest;
    }

}
