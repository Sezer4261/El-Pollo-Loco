const BACKGROUND_LAYER_GROUPS = [
    {
        path: "img/5_background/layers/air.png",
        isSky: true,
        speed: 0
    },
    {
        folder: "img/5_background/layers/4_clouds/",
        files: ["1.png", "2.png"],
        tileWidth: 960,
        speed: 0.2
    },
    {
        folder: "img/5_background/",
        files: ["first_half_background.png", "second_half_background.png"],
        tileWidth: 1920,
        speed: 1,
        isComposite: true
    }
];

const GROUND_FILL_HEIGHT = 72;
const GROUND_FILL_COLOR = "#c9a66b";
