const COIN_GROUND_Y = 420;
const COIN_JUMP_Y = 220;

const level1Data = {
    width: LEVEL_WIDTH,
    endX: LEVEL_END,
    endboss: { x: 5000, left: 4680, right: 5450 },
    enemies: [
        { x: 700, direction: -1, small: false },
        { x: 950, direction: -1, small: true },
        { x: 1200, direction: 1, small: true },
        { x: 1550, direction: -1, small: false },
        { x: 1750, direction: 1, small: false },
        { x: 1900, direction: -1, small: true },
        { x: 2200, direction: -1, small: false },
        { x: 2450, direction: 1, small: true },
        { x: 2700, direction: -1, small: true },
        { x: 2950, direction: -1, small: false },
        { x: 3150, direction: 1, small: false },
        { x: 3350, direction: -1, small: true },
        { x: 3500, direction: 1, small: true },
        { x: 3680, direction: -1, small: false },
        { x: 3820, direction: 1, small: true },
        { x: 3950, direction: -1, small: true },
        { x: 4080, direction: 1, small: false },
        { x: 4180, direction: -1, small: true },
        { x: 4280, direction: 1, small: false },
        { x: 4360, direction: -1, small: true },
        { x: 4440, direction: 1, small: false },
        { x: 4520, direction: -1, small: true },
        { x: 4580, direction: 1, small: false },
        { x: 4640, direction: -1, small: false },
        { x: 4690, direction: 1, small: true },
        { x: 4730, direction: -1, small: true },
        { x: 4770, direction: 1, small: false },
        { x: 4810, direction: -1, small: true },
        { x: 4850, direction: 1, small: false },
        { x: 4890, direction: -1, small: true },
        { x: 4930, direction: 1, small: false },
        { x: 4970, direction: -1, small: true }
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
