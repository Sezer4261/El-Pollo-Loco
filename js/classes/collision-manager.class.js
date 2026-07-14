/**
 * Handles collision detection with offset hitboxes.
 */
class CollisionManager {

    /**
     * Checks if character stomps enemy from above.
     * @param {Character} character - Player character.
     * @param {MovableObject} enemy - Enemy object.
     * @returns {boolean} True when stomp is valid.
     */
    isStomp(character, enemy) {
        if (enemy.isDead) return false;
        if (!character.isColliding(enemy)) return false;
        const isFalling = character.speedY > 0;
        const justLanded = character.speedY === 0 && character.prevSpeedY > 0;
        if (!isFalling && !justLanded) return false;
        const charBox = character.getHitBox();
        const enemyBox = enemy.getHitBox();
        const charBottom = charBox.y + charBox.h;
        const stompZone = enemyBox.y + Math.min(28, enemyBox.h * 0.45);
        return charBottom <= stompZone;
    }


    /**
     * Checks side collision causing character damage.
     * @param {Character} character - Player character.
     * @param {MovableObject} enemy - Enemy object.
     * @returns {boolean} True when side hit occurs.
     */
    isSideHit(character, enemy) {
        if (enemy.isDead) return false;
        if (!character.isColliding(enemy)) return false;
        return !this.isStomp(character, enemy);
    }


    /**
     * Checks side collision with endboss.
     * @param {Character} character - Player character.
     * @param {Endboss} boss - Endboss instance.
     * @returns {boolean} True when boss damages character.
     */
    isBossSideHit(character, boss) {
        return this.isSideHit(character, boss);
    }

}
