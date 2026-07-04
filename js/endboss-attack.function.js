/**
 * Starts the attack loop when the player enters the boss arena.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function tryStartEndbossAttack(boss, character) {
    if (boss.isAttacking || boss.isHurt || boss.isDead || boss.isAlert) return;
    if (!isPlayerInBossArena(character, boss)) return;
    const now = performance.now();
    if (now < boss.nextAttackTime) return;
    boss.isAttacking = true;
    setEndbossAttackPhase(boss, "chase");
}


/**
 * Returns horizontal distance between boss and player centers.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @returns {number} Distance in pixels.
 */
function getEndbossPlayerDistance(boss, character) {
    const playerCenter = character.x + character.width / 2;
    const bossCenter = boss.x + boss.width / 2;
    return Math.abs(playerCenter - bossCenter);
}


/**
 * Switches the boss into a new attack phase.
 * @param {Endboss} boss - Endboss instance.
 * @param {string} phase - Attack phase name.
 */
function setEndbossAttackPhase(boss, phase) {
    boss.attackPhase = phase;
    boss.attackPhaseStart = performance.now();
    boss.retreatJumpStarted = false;
    boss.beakHitDealt = false;
    boss.attackAnimDone = false;
    if (phase === "peck") {
        boss.setState("attack");
        boss.frameIndex = 0;
        boss.img = boss.frameLists.attack[0];
        boss.lastAnimTime = performance.now();
        return;
    }
    boss.setState("walk");
}


/**
 * Launches the boss away from the player after an attack.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 */
function launchEndbossRetreatJump(boss, character) {
    const away = -getEndbossTowardPlayer(boss, character);
    const dist = getEndbossPlayerDistance(boss, character);
    boss.speedY = -18 - Math.min(8, dist / 80);
    boss.speedX = away * Math.min(13, 7 + dist / 60);
    boss.isJumping = true;
    boss.retreatJumpStarted = true;
    boss.direction = away;
}


/**
 * Plays the grain-peck attack animation with a forward lunge.
 * @param {Endboss} boss - Endboss instance.
 * @param {number} now - Current timestamp.
 * @param {Function} onComplete - Callback when peck finishes.
 */
function updateEndbossPeck(boss, now, onComplete) {
    boss.speedX = 0;
    const frames = boss.frameLists.attack;
    if (!frames?.length) {
        onComplete();
        return;
    }
    if (boss.currentState !== "attack") boss.setState("attack");
    if (now - boss.lastAnimTime >= 70) {
        if (boss.frameIndex < frames.length - 1) {
            boss.frameIndex++;
            boss.img = frames[boss.frameIndex];
        } else {
            boss.attackAnimDone = true;
        }
        boss.lastAnimTime = now;
    }
    if (boss.frameIndex >= 2 && boss.frameIndex <= 5) {
        const dir = boss.otherDirection ? 1 : -1;
        boss.x += dir * 2.4;
    }
    if (boss.attackAnimDone || now - boss.attackPhaseStart > 720) onComplete();
}


/**
 * Returns true when the player is within the boss beak hitbox.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @returns {boolean} Beak range state.
 */
function isPlayerInBeakRange(boss, character) {
    const dir = boss.otherDirection ? 1 : -1;
    const beak = {
        x: dir > 0 ? boss.x + boss.width * 0.5 : boss.x + boss.width * 0.06,
        y: boss.y + boss.height * 0.55,
        w: boss.width * 0.4,
        h: boss.height * 0.3
    };
    const player = character.getHitBox();
    return player.x < beak.x + beak.w && player.x + player.w > beak.x &&
        player.y < beak.y + beak.h && player.y + player.h > beak.y;
}


/**
 * Runs chase, peck and retreat jumps in a repeating attack loop.
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @returns {boolean} True when attack logic handled movement.
 */
function updateEndbossAttack(boss, character) {
    if (!boss.isAttacking) return false;
    const now = performance.now();
    const dist = getEndbossPlayerDistance(boss, character);
    const toward = getEndbossTowardPlayer(boss, character);
    switch (boss.attackPhase) {
        case "chase":
            boss.direction = toward;
            boss.x += toward * 7.4;
            if (dist < 230 && isEndbossOnGround(boss) && !boss.isJumping) {
                setEndbossAttackPhase(boss, "peck");
            }
            break;
        case "peck":
            boss.direction = toward;
            updateEndbossPeck(boss, now, () => setEndbossAttackPhase(boss, "retreat"));
            break;
        case "retreat":
            if (!boss.retreatJumpStarted && isEndbossOnGround(boss) && !boss.isJumping) {
                launchEndbossRetreatJump(boss, character);
            } else if (boss.retreatJumpStarted && isEndbossOnGround(boss) && !boss.isJumping) {
                setEndbossAttackPhase(boss, "chase");
            }
            break;
        default:
            setEndbossAttackPhase(boss, "chase");
            break;
    }
    updateEndbossFacing(boss);
    return true;
}


/**
 * Returns movement direction toward the player (-1 or 1).
 * @param {Endboss} boss - Endboss instance.
 * @param {Character} character - Player character.
 * @returns {number} Direction multiplier.
 */
function getEndbossTowardPlayer(boss, character) {
    const playerCenter = character.x + character.width / 2;
    const bossCenter = boss.x + boss.width / 2;
    return playerCenter < bossCenter ? -1 : 1;
}
