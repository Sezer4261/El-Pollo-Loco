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
        document.getElementById(btnId).addEventListener("click", () => {
            document.getElementById(modalId).classList.remove("modal--hidden");
        });
    }


    /**
     * Binds modal close on overlay click and X button.
     * @param {string} modalId - Modal element id.
     */
    bindClose(modalId) {
        const modal = document.getElementById(modalId);
        modal.querySelector(".modal__close").addEventListener("click", () => {
            modal.classList.add("modal--hidden");
        });
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.classList.add("modal--hidden");
        });
    }

}
