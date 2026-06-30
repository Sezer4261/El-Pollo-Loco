const COIN_GROUND_Y = 420;
const COIN_JUMP_Y = 220;

const level1Data = {
    width: LEVEL_WIDTH,
    endX: LEVEL_END,
    endboss: { x: 5000, left: 4780, right: 5320 },
    enemies: [
        { x: 900, left: 850, right: 1050, small: false },
        { x: 1200, left: 1150, right: 1300, small: true },
        { x: 1700, left: 1650, right: 1850, small: false },
        { x: 2100, left: 2050, right: 2250, small: true },
        { x: 2600, left: 2550, right: 2750, small: false },
        { x: 3100, left: 3050, right: 3250, small: true },
        { x: 3600, left: 3550, right: 3750, small: false },
        { x: 4100, left: 4050, right: 4250, small: true }
    ],
    coins: [
        { x: 300, y: COIN_GROUND_Y },
        { x: 550, y: COIN_JUMP_Y },
        { x: 850, y: COIN_GROUND_Y },
        { x: 1150, y: COIN_JUMP_Y },
        { x: 1500, y: COIN_GROUND_Y },
        { x: 2000, y: COIN_GROUND_Y },
        { x: 2350, y: COIN_JUMP_Y },
        { x: 2800, y: COIN_GROUND_Y },
        { x: 3400, y: COIN_JUMP_Y },
        { x: 4000, y: COIN_GROUND_Y }
    ],
    bottles: [
        { x: 450, y: 400 },
        { x: 1000, y: 400 },
        { x: 1650, y: 400 },
        { x: 2250, y: 400 },
        { x: 2950, y: 400 },
        { x: 3550, y: 400 },
        { x: 4150, y: 400 },
        { x: 4850, y: 400 }
    ]
};
