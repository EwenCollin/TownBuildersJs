import Block from "./Block";

export default class Chunk {
    static chunkSize = 16;
    static chunkHeight = 10;

    static blockCoordToIndex(blockCoord) {
        return (blockCoord.y * Chunk.chunkSize * Chunk.chunkSize) + (blockCoord.z * Chunk.chunkSize) + blockCoord.x;
    }

    static indexToBlockCoord(index) {
        var y = Math.floor(index/(Chunk.chunkSize*Chunk.chunkSize));
        var idx_sub = index - (y*Chunk.chunkSize*Chunk.chunkSize);
        return {x: idx_sub % Chunk.chunkSize, z: Math.floor(idx_sub/Chunk.chunkSize), y: y};
    }

    constructor(position_x, position_z, assetManager, rootTransform) {
        this.rootTransform = BABYLON.Matrix.Identity();
        this.assetManager = assetManager;
        this.position_x = position_x;
        this.position_z = position_z;

        BABYLON.Tools.Log("After chunk property setup");
        this.blocks = [];
        this.fill("air", {});
        BABYLON.Tools.Log("before update root transform");
        this.updateRootTransform(rootTransform);
        BABYLON.Tools.Log("After update root transform");
    }

    updateRootTransform(rootTransform) {
        this.rootTransform.copyFrom(BABYLON.Matrix.Translation(this.position_x*Chunk.chunkSize, 0, this.position_z*Chunk.chunkSize).multiply(rootTransform.clone()));
        for (var i = 0; i < Chunk.chunkSize*Chunk.chunkSize*Chunk.chunkHeight; i++) {
            //BABYLON.Tools.Log("Before block update root transform");
            this.blocks[i].updateRootTransform(this.rootTransform.clone());
        }
    }

    getBlock(localPosition) {
        return this.blocks[Chunk.blockCoordToIndex(localPosition)];
    }

    setBlock(position, id, blockState) {
        var localPosition = {
            x: position.x % Chunk.chunkSize,
            y: position.y % Chunk.chunkHeight,
            z: position.z % Chunk.chunkSize };
        var currentBlock = this.getBlock(localPosition);
        var currentId = currentBlock.getId();
        if ((currentId == "air" && id != "air") || (currentId != "air" && id == "air")) {
            BABYLON.Tools.Log("Chunk before create");
            currentBlock.dispose();
            BABYLON.Tools.Log("Chunk before new");
            this.blocks[Chunk.blockCoordToIndex(localPosition)] = new Block(id, {position: localPosition, blockState: blockState}, this.assetManager, this.rootTransform);
            return true;
        }
        return false;
    }

    getPosition() {
        return {x: this.position_x, z: this.position_z};
    }

    fill(blockType, blockState) {
        //TODO: fill event
        this.blocks = [];
        for (var i = 0; i < Chunk.chunkSize*Chunk.chunkSize*Chunk.chunkHeight; i++) {
            //BABYLON.Tools.Log("In chunk fill");
            var metadata = {position: Chunk.indexToBlockCoord(i), blockState: blockState};
            //BABYLON.Tools.Log("After metadata");
            this.blocks.push(new Block(blockType, metadata, this.assetManager, this.rootTransform));
        }
    }
}