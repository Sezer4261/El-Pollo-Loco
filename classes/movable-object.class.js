const GROUND_Y = 283;
const GRAVITY = 1.8;
const LOW_THROW_Y = GROUND_Y + 168;
const BOSS_BOTTLE_DAMAGE = 20;

/**
 * Base class for all movable game objects with physics.
 */
class MovableObject extends DrawableObject {
    speedX = 0;
    speedY = 0;
    otherDirection = false;
    offset = { top: 0, left: 0, right: 0, bottom: 0 };

    /**
     * Returns the collision hitbox with offsets applied.
     * @returns {{x: number, y: number, w: number, h: number}} Hitbox.
     */
    getHitBox() {
        return {
            x: this.x + this.offset.left,
            y: this.y + this.offset.top,
            w: this.width - this.offset.left - this.offset.right,
            h: this.height - this.offset.top - this.offset.bottom
        };
    }


    /**
     * Checks overlap with another object using hitboxes.
     * @param {MovableObject} obj - Object to test.
     * @returns {boolean} True when hitboxes overlap.
     */
    isColliding(obj) {
        const a = this.getHitBox();
        const b = obj.getHitBox();
        return a.x < b.x + b.w && a.x + a.w > b.x &&
            a.y < b.y + b.h && a.y + a.h > b.y;
    }


    /**
     * Returns true when the object is above ground level.
     * @returns {boolean} Above ground state.
     */
    isAboveGround() {
        return this.y < GROUND_Y;
    }


    /**
     * Applies gravity to vertical movement.
     */
    applyGravity() {
        if (!this.isAboveGround()) {
            this.y = GROUND_Y;
            this.speedY = 0;
            return;
        }
        this.speedY += GRAVITY;
        this.y += this.speedY;
    }

}
