const CHARACTER_FRAME_CONFIG = [
    { key: "idle", basePath: "img/2_character_pepe/1_idle/idle/I-", start: 1, end: 10 },
    { key: "longIdle", basePath: "img/2_character_pepe/1_idle/long_idle/I-", start: 11, end: 20 },
    { key: "walk", basePath: "img/2_character_pepe/2_walk/W-", start: 21, end: 26 },
    { key: "duck", basePath: "img/2_character_pepe/1_idle/idle/I-", start: 1, end: 1 },
    { key: "jump", basePath: "img/2_character_pepe/3_jump/J-", start: 31, end: 39 },
    { key: "hurt", basePath: "img/2_character_pepe/4_hurt/H-", start: 41, end: 43 },
    { key: "dead", basePath: "img/2_character_pepe/5_dead/D-", start: 51, end: 57 }
];

const AUDIO_PATHS = {
    throw: { path: "Audio/shoot.wav", volume: 0.35 },
    hit: { path: "Audio/hit.wav", volume: 0.4 },
    bossHit: { path: "Audio/hit.wav", volume: 0.45 },
    coin: { path: "Audio/win.wav", volume: 0.3 },
    bottle: { path: "Audio/shoot.wav", volume: 0.25 },
    hurt: { path: "Audio/hit.wav", volume: 0.35 },
    gameOver: { path: "Audio/game-over.wav", volume: 0.5 },
    win: { path: "Audio/win.wav", volume: 0.5 },
    music: { path: "Audio/background.mp3", volume: 0.25 }
};

const KEYBOARD_MAP = {
    ArrowLeft: "LEFT",
    ArrowRight: "RIGHT",
    ArrowUp: "UP",
    ArrowDown: "DOWN",
    a: "LEFT",
    A: "LEFT",
    d: "RIGHT",
    D: "RIGHT",
    w: "UP",
    W: "UP",
    s: "DOWN",
    S: "DOWN",
    " ": "SPACE"
};

const KEY_CODE_MAP = {
    ArrowLeft: "LEFT",
    ArrowRight: "RIGHT",
    ArrowUp: "UP",
    ArrowDown: "DOWN",
    KeyA: "LEFT",
    KeyD: "RIGHT",
    KeyW: "UP",
    KeyS: "DOWN",
    Space: "SPACE"
};

const GAME_CONTROL_ACTIONS = new Set(["LEFT", "RIGHT", "UP", "DOWN", "SPACE"]);

const TARGET_FPS = 60;
const GRAVITY = 1.65;
const CANVAS_HEIGHT = 480;
const BACKGROUND_GROUND_Y = Math.round(CANVAS_HEIGHT * (961 / 1080));
const CANVAS_GROUND_Y = BACKGROUND_GROUND_Y;
const CHARACTER_WIDTH = 120;
const CHARACTER_HEIGHT = 236;
const CHARACTER_DUCK_HEIGHT = 118;
const CHARACTER_WALK_SPEED = 5.5;
const CHARACTER_DUCK_SPEED = 3.8;
const CHARACTER_JUMP_SPEED = 23;
const CHARACTER_JUMP_FRAME_MS = 75;
const CHARACTER_SLEEP_MS = 5000;
const CHICKEN_SPEED_NORMAL = 2.6;
const CHICKEN_SPEED_SMALL = 3;
const STOMP_BOUNCE_SPEED = 8.5;
const BOTTLE_THROW_SPEED_X = 12;
const BOTTLE_THROW_SPEED_X_LOW = 19;
const BOTTLE_THROW_SPEED_Y = -21;
const GROUND_Y = CANVAS_GROUND_Y - CHARACTER_HEIGHT;
const LEVEL_MIN_X = 0;
const LEVEL_WIDTH = 5760;
const CHICKEN_CONTACT_DAMAGE = 10;
const ENDBOSS_CONTACT_DAMAGE = 28;
const ENDBOSS_HEALTH = 100;
const BOSS_BOTTLE_DAMAGE = 20;
const BOTTLE_THROW_COOLDOWN_MS = 1100;
const ENDBOSS_STAGGER_COOLDOWN_MS = 1000;
const ENDBOSS_CHASE_SPEED = 6.5;
const ENDBOSS_PATROL_CHASE_SPEED = 5.5;
const ENDBOSS_CONTACT_COOLDOWN_MS = 900;
const ENDBOSS_ENGAGE_DISTANCE = 720;
const ENDBOSS_CHASE_REACH = 1000;
const ENDBOSS_STRIKE_RANGE = 90;
const ENDBOSS_STRIKE_RANGE_EXIT = 140;
const ENDBOSS_STRIKE_SPEED = 2.8;
const ENDBOSS_RECOVER_MS = 800;
const ENDBOSS_RETREAT_SPEED = 7;
const ENDBOSS_PATROL_SPEED = 1.6;
const ENDBOSS_HURT_MS = 400;
const ENDBOSS_HIT_FLASH_MS = 450;
const COIN_GROUND_Y = CANVAS_GROUND_Y - 78;
const COIN_JUMP_Y = CANVAS_GROUND_Y - 260;
const COIN_JUMP_COLLECT_MAX_Y = CANVAS_GROUND_Y - 150;
const JUMP_COIN_MIN_LIFT = 55;
const BOTTLE_DISPLAY_SIZE = 76;
const BOTTLE_FEET_RATIO = 354 / 400;
const BOTTLE_GROUND_Y = CANVAS_GROUND_Y - Math.round(BOTTLE_DISPLAY_SIZE * BOTTLE_FEET_RATIO);

const BACKGROUND_GROUND_SRC_Y = 448;
const BACKGROUND_GROUND_TILE_WIDTH = 1920;
const BACKGROUND_CLOUD_TILE_WIDTH = 3840;

const BACKGROUND_LAYER_GROUPS = [
    { path: "img/5_background/layers/air.png", isSky: true, speed: 0 },
    {
        folder: "img/5_background/layers/4_clouds/",
        files: ["full.png"],
        tileWidth: BACKGROUND_CLOUD_TILE_WIDTH,
        speed: 0.2,
        driftSpeed: 2
    },
    {
        folder: "img/5_background/",
        files: ["first_half_background.png", "second_half_background.png"],
        tileWidth: BACKGROUND_GROUND_TILE_WIDTH,
        speed: 1,
        srcY: BACKGROUND_GROUND_SRC_Y
    }
];

const BACKGROUND_SEAM_OVERLAP = 1;

const ENDBOSS_FRAME_PATHS = {
    walk: [
        "img/4_enemie_boss_chicken/1_walk/G1.png",
        "img/4_enemie_boss_chicken/1_walk/G2.png",
        "img/4_enemie_boss_chicken/1_walk/G3.png",
        "img/4_enemie_boss_chicken/1_walk/G4.png"
    ],
    alert: [
        "img/4_enemie_boss_chicken/2_alert/G5.png",
        "img/4_enemie_boss_chicken/2_alert/G6.png",
        "img/4_enemie_boss_chicken/2_alert/G7.png",
        "img/4_enemie_boss_chicken/2_alert/G8.png",
        "img/4_enemie_boss_chicken/2_alert/G9.png",
        "img/4_enemie_boss_chicken/2_alert/G10.png",
        "img/4_enemie_boss_chicken/2_alert/G11.png",
        "img/4_enemie_boss_chicken/2_alert/G12.png"
    ],
    attack: [
        "img/4_enemie_boss_chicken/3_attack/G13.png",
        "img/4_enemie_boss_chicken/3_attack/G14.png",
        "img/4_enemie_boss_chicken/3_attack/G15.png",
        "img/4_enemie_boss_chicken/3_attack/G16.png",
        "img/4_enemie_boss_chicken/3_attack/G17.png",
        "img/4_enemie_boss_chicken/3_attack/G18.png",
        "img/4_enemie_boss_chicken/3_attack/G19.png",
        "img/4_enemie_boss_chicken/3_attack/G20.png"
    ],
    hurt: [
        "img/4_enemie_boss_chicken/4_hurt/G21.png",
        "img/4_enemie_boss_chicken/4_hurt/G22.png",
        "img/4_enemie_boss_chicken/4_hurt/G23.png"
    ],
    dead: [
        "img/4_enemie_boss_chicken/5_dead/G24.png",
        "img/4_enemie_boss_chicken/5_dead/G25.png",
        "img/4_enemie_boss_chicken/5_dead/G26.png"
    ]
};
