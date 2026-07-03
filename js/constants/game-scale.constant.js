const CANVAS_GROUND_Y = 480;
const CHARACTER_WIDTH = 120;
const CHARACTER_HEIGHT = 236;
const GROUND_Y = CANVAS_GROUND_Y - CHARACTER_HEIGHT;
const LEVEL_MIN_X = 0;
const CHICKEN_CONTACT_DAMAGE = 10;
const ENDBOSS_CONTACT_DAMAGE = 20;


/**
 * Returns the Y position for an entity standing on the ground.
 * @param {number} entityHeight - Entity height.
 * @returns {number} Top Y coordinate.
 */
function getGroundYForHeight(entityHeight) {
    return CANVAS_GROUND_Y - entityHeight;
}
