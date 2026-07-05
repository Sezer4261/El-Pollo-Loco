/**
 * Initializes managers and binds all application events.
 */
function initializeApp() {
    screenManager = new ScreenManager();
    modalManager = new ModalManager();
    fullscreenManager = new FullscreenManager();
    screenManager.bindEvents();
    modalManager.bindEvents();
    fullscreenManager.bindButtons();
    bindKeyboardEvents();
    bindTouchEvents();
    initGameLayoutSync();
    applySavedMuteState();
    audioManager.startMenuMusic();
    bindMenuMusicUnlock();
}
