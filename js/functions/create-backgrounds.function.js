/**
 * Builds all parallax background tiles for a level.
 * @param {number} levelWidth - Total level width.
 * @returns {BackgroundObject[]} Background tiles.
 */
function createParallaxBackgrounds(levelWidth) {
    const tiles = [];
    BACKGROUND_LAYER_GROUPS.forEach((group, layerId) => {
        if (group.isSky) {
            tiles.push(new BackgroundObject(group.path, 0, { ...group, layerId }));
            return;
        }
        if (group.isComposite) {
            for (let x = 0; x <= levelWidth; x += group.tileWidth) {
                const file = group.files[(x / group.tileWidth) % group.files.length];
                tiles.push(new BackgroundObject(group.folder + file, x, { ...group, layerId }));
            }
            return;
        }
        group.files.forEach((file, index) => {
            tiles.push(new BackgroundObject(
                group.folder + file,
                index * group.tileWidth,
                { ...group, layerId }
            ));
        });
    });
    return tiles;
}
