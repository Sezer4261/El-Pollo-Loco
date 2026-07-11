const BACKGROUND_GROUND_SRC_Y = 448;
const BACKGROUND_GROUND_TILE_WIDTH = 1920;
const BACKGROUND_CLOUD_TILE_WIDTH = 3840;

const BACKGROUND_LAYER_GROUPS = [
    {
        path: "img/5_background/layers/air.png",
        isSky: true,
        speed: 0
    },
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
