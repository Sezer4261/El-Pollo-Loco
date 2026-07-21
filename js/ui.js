/**
 * Manages screen visibility and navigation between game states.
 */
class ScreenManager {
    /**
     * Binds UI button events for navigation.
     */
    bindEvents() {
        this.bindStartButtons();
        this.bindEndScreenButtons();
        this.bindMuteButtons();
    }

    /**
     * Binds the main start button.
     */
    bindStartButtons() {
        bindClick("startButton", () => this.startGame());
    }

    /**
     * Binds restart and exit buttons on the end screen.
     */
    bindEndScreenButtons() {
        bindClick("restartButton", () => this.restartGame());
        bindClick("exitButton", () => this.exitToHome());
    }

    /**
     * Binds both mute buttons.
     */
    bindMuteButtons() {
        bindClick("muteButton", () => this.toggleMute());
        bindClick("homeMuteButton", () => this.toggleMute());
    }

    /**
     * Hides a screen element by id.
     * @param {string} id - Element id.
     */
    hideScreen(id) {
        document.getElementById(id).classList.add("screen--hidden");
    }

    /**
     * Shows a screen element by id.
     * @param {string} id - Element id.
     */
    showScreen(id) {
        document.getElementById(id).classList.remove("screen--hidden");
    }

    /**
     * Starts a new game session from the home screen.
     */
    startGame() {
        keyboard = new Keyboard();
        document.activeElement?.blur?.();
        this.hideScreen("homeScreen");
        this.showScreen("gameScreen");
        scheduleGameStageLayoutSync();
        focusGameCanvas();
        world = new World(document.getElementById("gameCanvas"));
        world.start();
    }

    /**
     * Restarts the current game without reloading the page.
     */
    restartGame() {
        keyboard = new Keyboard();
        rewardPopup.hide();
        this.hideScreen("endScreen");
        this.showScreen("gameScreen");
        scheduleGameStageLayoutSync();
        focusGameCanvas();
        world.reset();
        world.start();
    }

    /**
     * Returns from the end screen to the home screen.
     */
    exitToHome() {
        rewardPopup.hide();
        if (world) world.stop();
        this.hideScreen("endScreen");
        this.hideScreen("gameScreen");
        this.showScreen("homeScreen");
        keyboard = new Keyboard();
        audioManager.startMenuMusic(true);
    }

    /**
     * Shows the end screen with win or lose copy.
     * @param {boolean} won - Whether the player won.
     */
    showEndScreen(won) {
        this.hideScreen("gameScreen");
        this.showScreen("endScreen");
        const endScreen = document.getElementById("endScreen");
        const copy = getEndScreenCopy(won);
        updateEndScreenState(endScreen, won);
        document.getElementById("endTitle").textContent = copy.title;
        document.getElementById("endMessage").textContent = copy.message;
    }

    /**
     * Toggles mute and refreshes the button icon state.
     */
    toggleMute() {
        updateMuteButtonIcons(audioManager.toggleMute());
    }
}

/**
 * Manages help and controls modal dialogs.
 */
class ModalManager {
    /**
     * Binds modal open and close events.
     */
    bindEvents() {
        this.bindOpen("helpButton", "helpModal");
        this.bindOpen("controlsButton", "controlsModal");
        this.bindClose("helpModal");
        this.bindClose("controlsModal");
    }

    /**
     * Binds a button to open a modal.
     * @param {string} btnId - Button element id.
     * @param {string} modalId - Modal element id.
     */
    bindOpen(btnId, modalId) {
        bindClick(btnId, () => document.getElementById(modalId).classList.remove("modal--hidden"));
    }

    /**
     * Binds modal close on overlay click and X button.
     * @param {string} modalId - Modal element id.
     */
    bindClose(modalId) {
        const modal = document.getElementById(modalId);
        modal.querySelector(".modal__close").addEventListener("click", () => modal.classList.add("modal--hidden"));
        modal.addEventListener("click", (event) => {
            if (event.target === modal) modal.classList.add("modal--hidden");
        });
    }
}

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
     * Returns true on desktop devices with mouse and keyboard.
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
        document.documentElement.requestFullscreen().catch((error) => {
            handleError("Fullscreen request failed:", error);
        });
    }

    /**
     * Exits fullscreen mode.
     */
    exit() {
        if (!this.isActive()) return;
        document.exitFullscreen().catch((error) => {
            handleError("Fullscreen exit failed:", error);
        });
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
        const active = this.isActive();
        this.buttons.forEach((button) => updateFullscreenButton(button, active));
    }
}

/**
 * Binds a click handler to an element by id.
 * @param {string} id - Element id.
 * @param {Function} handler - Click callback.
 */
function bindClick(id, handler) {
    document.getElementById(id).addEventListener("click", handler);
}

/**
 * Focuses the game canvas when available.
 */
function focusGameCanvas() {
    document.getElementById("gameCanvas")?.focus();
}

/**
 * Updates win and loss classes on the end screen.
 * @param {HTMLElement} endScreen - End screen element.
 * @param {boolean} won - Whether the player won.
 */
function updateEndScreenState(endScreen, won) {
    endScreen.classList.toggle("end-screen--won", won);
    endScreen.classList.toggle("end-screen--lost", !won);
}

/**
 * Returns the end screen title and message.
 * @param {boolean} won - Whether the player won.
 * @returns {{title:string,message:string}} End screen copy.
 */
function getEndScreenCopy(won) {
    return won
        ? { title: "Spiel gewonnen!", message: "Pepe hat den Endboss besiegt!" }
        : { title: "Game Over", message: "Pepe wurde besiegt. Versuch es nochmal!" };
}

/**
 * Updates one fullscreen button label and icon.
 * @param {HTMLElement} button - Fullscreen button element.
 * @param {boolean} active - Whether fullscreen is active.
 */
function updateFullscreenButton(button, active) {
    const label = active ? "Vollbild beenden" : "Vollbild";
    button.textContent = active ? "\u{1F5D7}" : "\u26F6";
    button.setAttribute("aria-label", label);
    button.title = label;
}
