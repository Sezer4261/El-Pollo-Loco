/**
 * Endboss chicken with alert, attack and hurt states.
 */
class Endboss extends MovableObject {
    health = 100;
    maxHealth = 100;
    isDead = false;
    isHurt = false;
    isAlert = false;
    currentState = "walk";
    frameLists = {};
    frameIndex = 0;
    lastAnimTime = 0;
    hurtEndTime = 0;
    alertEndTime = 0;
    direction = -1;

    /**
     * Creates the endboss at the given position.
     * @param {number} x - Start X position.
     */
    constructor(x) {
        super();
        this.x = x;
        this.y = 55;
        this.width = 200;
        this.height = 320;
        this.offset = { top: 40, left: 30, right: 30, bottom: 20 };
        this.loadAnimations();
        this.img = this.frameLists.walk[0];
    }


    /**
     * Loads all endboss animation frames.
     */
    loadAnimations() {
        this.frameLists.walk = this.loadImages([
            "img/4_enemie_boss_chicken/1_walk/G1.png",
            "img/4_enemie_boss_chicken/1_walk/G2.png",
            "img/4_enemie_boss_chicken/1_walk/G3.png",
            "img/4_enemie_boss_chicken/1_walk/G4.png"
        ]);
        this.frameLists.alert = this.loadImages([
            "img/4_enemie_boss_chicken/2_alert/G5.png",
            "img/4_enemie_boss_chicken/2_alert/G6.png",
            "img/4_enemie_boss_chicken/2_alert/G7.png",
            "img/4_enemie_boss_chicken/2_alert/G8.png",
            "img/4_enemie_boss_chicken/2_alert/G9.png",
            "img/4_enemie_boss_chicken/2_alert/G10.png",
            "img/4_enemie_boss_chicken/2_alert/G11.png",
            "img/4_enemie_boss_chicken/2_alert/G12.png"
        ]);
        this.frameLists.hurt = this.loadImages([
            "img/4_enemie_boss_chicken/4_hurt/G21.png",
            "img/4_enemie_boss_chicken/4_hurt/G22.png",
            "img/4_enemie_boss_chicken/4_hurt/G23.png"
        ]);
        this.frameLists.dead = this.loadImages([
            "img/4_enemie_boss_chicken/5_dead/G24.png",
            "img/4_enemie_boss_chicken/5_dead/G25.png",
            "img/4_enemie_boss_chicken/5_dead/G26.png"
        ]);
    }


    /**
     * Updates boss movement and animation.
     * @param {Character} character - Player character reference.
     */
    update(character) {
        if (this.isDead) {
            this.updateAnimation(performance.now());
            return;
        }
        this.updateStates(character);
        this.patrol();
        this.updateAnimation(performance.now());
    }


    /**
     * Switches alert state when character is near.
     * @param {Character} character - Player character.
     */
    updateStates(character) {
        const now = performance.now();
        if (this.isHurt && now > this.hurtEndTime) {
            this.isHurt = false;
            this.setState("walk");
        }
        if (this.isAlert && now > this.alertEndTime) {
            this.isAlert = false;
            this.setState("walk");
        }
        const dist = Math.abs(character.x - this.x);
        if (dist < 400 && !this.isHurt) {
            this.isAlert = true;
            this.alertEndTime = now + 2000;
            this.setState("alert");
        }
    }


    /**
     * Moves the boss slowly left and right.
     */
    patrol() {
        if (this.isHurt) return;
        this.x += this.direction * 0.8;
        this.otherDirection = this.direction < 0;
        if (this.x < 3000) this.direction = 1;
        if (this.x > 3400) this.direction = -1;
    }


    /**
     * Sets the current animation state.
     * @param {string} state - State name.
     */
    setState(state) {
        if (this.currentState === state) return;
        this.currentState = state;
        this.frameIndex = 0;
    }


    /**
     * Advances animation frames.
     * @param {number} now - Current timestamp.
     */
    updateAnimation(now) {
        if (now - this.lastAnimTime < 150) return;
        const frames = this.frameLists[this.currentState] || this.frameLists.walk;
        if (this.isDead && this.frameIndex >= frames.length - 1) return;
        this.frameIndex = this.isDead
            ? Math.min(this.frameIndex + 1, frames.length - 1)
            : (this.frameIndex + 1) % frames.length;
        this.img = frames[this.frameIndex];
        this.lastAnimTime = now;
    }


    /**
     * Applies bottle damage to the boss.
     * @param {number} amount - Damage amount.
     */
    takeDamage(amount) {
        if (this.isDead) return;
        this.health = Math.max(0, this.health - amount);
        this.isHurt = true;
        this.hurtEndTime = performance.now() + 600;
        this.setState("hurt");
        if (this.health <= 0) this.die();
    }


    /**
     * Plays death animation.
     */
    die() {
        this.isDead = true;
        this.setState("dead");
    }

}
