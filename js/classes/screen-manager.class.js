/**
 * Manages screen visibility and navigation between game states.
 */
class ScreenManager {

    /**
     * Binds UI button events for navigation.
     */
    bindEvents() {
        document.getElementById("startButton").addEventListener("click", () => {
            this.startGame();
        });
        document.getElementById("restartButton").addEventListener("click", () => {
            this.restartGame();
        });
        document.getElementById("exitButton").addEventListener("click", () => {
            this.exitToHome();
        });
        document.getElementById("muteButton").addEventListener("click", () => {
            this.toggleMute();
        });
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
     * Starts a new game session from home screen.
     */
    startGame() {
        keyboard = new Keyboard();
        document.activeElement?.blur?.();
        this.hideScreen("homeScreen");
        this.showScreen("gameScreen");
        scheduleGameStageLayoutSync();
        const canvas = document.getElementById("gameCanvas");
        canvas?.focus();
        world = new World(canvas);
        world.start();
    }


    /**
     * Restarts without page reload.
     */
    restartGame() {
        keyboard = new Keyboard();
        rewardPopup.hide();
        this.hideScreen("endScreen");
        this.showScreen("gameScreen");
        scheduleGameStageLayoutSync();
        document.getElementById("gameCanvas")?.focus();
        world.reset();
        world.start();
    }


    /**
     * Returns to home screen from end screen.
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
     * Shows end screen with win or lose message.
     * @param {boolean} won - Whether player won.
     */
    showEndScreen(won) {
        this.hideScreen("gameScreen");
        this.showScreen("endScreen");
        const endScreen = document.getElementById("endScreen");
        endScreen.classList.toggle("end-screen--won", won);
        endScreen.classList.toggle("end-screen--lost", !won);
        document.getElementById("endTitle").textContent = won ? "Spiel gewonnen!" : "Game Over";
        document.getElementById("endMessage").textContent = won
            ? "Pepe hat den Endboss besiegt!"
            : "Pepe wurde besiegt. Versuch es nochmal!";
    }


    /**
     * Toggles mute and updates button icon.
     */
    toggleMute() {
        const muted = audioManager.toggleMute();
        document.getElementById("muteButton").textContent = muted ? "🔇" : "🔊";
    }

}
