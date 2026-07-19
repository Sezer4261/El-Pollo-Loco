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
