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
