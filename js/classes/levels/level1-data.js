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
        { x: 4290, direction: 1, small: true },
        { x: 4450, direction: 1, small: false },
        { x: 4560, direction: 1, small: true }
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
        { x: 450, y: BOTTLE_GROUND_Y },
        { x: 1000, y: BOTTLE_GROUND_Y },
        { x: 1650, y: BOTTLE_GROUND_Y },
        { x: 2250, y: BOTTLE_GROUND_Y },
        { x: 2950, y: BOTTLE_GROUND_Y },
        { x: 3550, y: BOTTLE_GROUND_Y },
        { x: 4150, y: BOTTLE_GROUND_Y },
        { x: 4850, y: BOTTLE_GROUND_Y }
    ]
};
