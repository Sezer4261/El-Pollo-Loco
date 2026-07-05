const CANVAS_HEIGHT = 480;
const BACKGROUND_GROUND_Y = Math.round(CANVAS_HEIGHT * (961 / 1080));
const CANVAS_GROUND_Y = BACKGROUND_GROUND_Y;
const CHARACTER_WIDTH = 120;
const CHARACTER_HEIGHT = 236;
const CHARACTER_DUCK_HEIGHT = 118;
const GROUND_Y = CANVAS_GROUND_Y - CHARACTER_HEIGHT;
const LEVEL_MIN_X = 0;
const CHICKEN_CONTACT_DAMAGE = 10;
const ENDBOSS_CONTACT_DAMAGE = 22;
const ENDBOSS_JUMP_DAMAGE = 30;
const ENDBOSS_BEAK_DAMAGE = 36;
const BOTTLE_THROW_COOLDOWN_MS = 1100;
const ENDBOSS_STAGGER_COOLDOWN_MS = 900;
const ENDBOSS_CHASE_SPEED = 10.2;
const ENDBOSS_PATROL_CHASE_SPEED = 7.8;
const ENDBOSS_PECK_RANGE = 300;
const ENDBOSS_HURT_MS = 380;


/**
 * Returns the Y position for an entity standing on the ground.
 * @param {number} entityHeight - Entity height.
 * @returns {number} Top Y coordinate.
 */
function getGroundYForHeight(entityHeight) {
    return CANVAS_GROUND_Y - entityHeight;
}
