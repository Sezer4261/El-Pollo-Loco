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
        if (!character.isColliding(enemy)) return false;
        if (!character.isAboveGround() || character.speedY <= 0) return false;
        const charBox = character.getHitBox();
        const enemyBox = enemy.getHitBox();
        return charBox.y + charBox.h <= enemyBox.y + 15;
    }


    /**
     * Checks side collision causing character damage.
     * @param {Character} character - Player character.
     * @param {MovableObject} enemy - Enemy object.
     * @returns {boolean} True when side hit occurs.
     */
    isSideHit(character, enemy) {
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
