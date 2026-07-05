const CANVAS_HEIGHT = 480;
const BACKGROUND_GROUND_Y = Math.round(CANVAS_HEIGHT * (961 / 1080));
const CANVAS_GROUND_Y = BACKGROUND_GROUND_Y;
const CHARACTER_WIDTH = 120;
const CHARACTER_HEIGHT = 236;
const CHARACTER_DUCK_HEIGHT = 118;
const GROUND_Y = CANVAS_GROUND_Y - CHARACTER_HEIGHT;
const LEVEL_MIN_X = 0;
const CHICKEN_CONTACT_DAMAGE = 10;
const ENDBOSS_CONTACT_DAMAGE = 28;
const ENDBOSS_JUMP_DAMAGE = 30;
const ENDBOSS_BEAK_DAMAGE = 42;
const ENDBOSS_HEALTH = 100;
const BOSS_BOTTLE_DAMAGE = 20;
const BOTTLE_THROW_COOLDOWN_MS = 1100;
const ENDBOSS_STAGGER_COOLDOWN_MS = 1000;
const ENDBOSS_CHASE_SPEED = 12;
const ENDBOSS_PATROL_CHASE_SPEED = 9;
const ENDBOSS_PECK_RANGE = 360;
const ENDBOSS_HURT_MS = 220;
const COIN_GROUND_Y = CANVAS_GROUND_Y - 60;
const COIN_JUMP_Y = CANVAS_GROUND_Y - 260;
const COIN_JUMP_COLLECT_MAX_Y = CANVAS_GROUND_Y - 150;
const BOTTLE_GROUND_Y = CANVAS_GROUND_Y - 80;


/**
 * Returns the Y position for an entity standing on the ground.
 * @param {number} entityHeight - Entity height.
 * @returns {number} Top Y coordinate.
 */
function getGroundYForHeight(entityHeight) {
    return CANVAS_GROUND_Y - entityHeight;
}
