/**
 * Handles browser fullscreen mode for desktop play.
 */
class FullscreenManager {
    buttons = [];

    /**
     * Binds all fullscreen toggle buttons.
     */
    bindButtons() {
        document.querySelectorAll("[data-fullscreen-btn]").forEach((button) => {
            button.addEventListener("click", () => this.toggle());
            this.buttons.push(button);
        });
        document.addEventListener("fullscreenchange", () => this.updateButtons());
        this.updateButtons();
    }


    /**
     * Returns true when fullscreen is supported.
     * @returns {boolean} Fullscreen support state.
     */
    isSupported() {
        return !!document.fullscreenEnabled;
    }


    /**
     * Returns true when fullscreen is active.
     * @returns {boolean} Active fullscreen state.
     */
    isActive() {
        return !!document.fullscreenElement;
    }


    /**
     * Returns true on desktop devices with mouse/keyboard.
     * @returns {boolean} Desktop device state.
     */
    isDesktop() {
        return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    }


    /**
     * Enters fullscreen mode.
     */
    request() {
        if (!this.isSupported() || this.isActive()) return;
        document.documentElement.requestFullscreen().catch(() => {});
    }


    /**
     * Exits fullscreen mode.
     */
    exit() {
        if (!this.isActive()) return;
        document.exitFullscreen().catch(() => {});
    }


    /**
     * Toggles fullscreen mode.
     */
    toggle() {
        if (this.isActive()) this.exit();
        else this.request();
    }


    /**
     * Enters fullscreen on desktop after a user click.
     */
    requestOnDesktop() {
        if (this.isDesktop()) this.request();
    }


    /**
     * Updates icon and labels on all fullscreen buttons.
     */
    updateButtons() {
        const label = this.isActive() ? "Vollbild beenden" : "Vollbild";
        const icon = this.isActive() ? "🗗" : "⛶";
        this.buttons.forEach((button) => {
            button.textContent = icon;
            button.setAttribute("aria-label", label);
            button.title = label;
        });
    }

}
