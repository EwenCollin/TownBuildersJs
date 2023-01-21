import Chunk from "./Chunk";

export default class ChunkOverlay {
    
    constructor() {
        this.chunk = BABYLON.MeshBuilder.CreateBox("chunkOverlay", {height: 1, width: Chunk.chunkSize, depth: Chunk.chunkSize});
        this.chunk.visibility = 0;
        this.enabledVisibility = 0.5;
        //this.highlightLayer = new BABYLON.HighlightLayer("hl1");
        //this.highlightLayer.addMesh(this.chunk, BABYLON.Color3.Blue());
        this.canPlace = true;
        this.setCanPlace(false);
    }

    setCanPlace(value) {
        if (this.canPlace != value) {
            this.canPlace = value;
            //this.highlightLayer.removeMesh(this.chunk);
            //this.highlightLayer.addMesh(this.chunk, this.canPlace ? BABYLON.Color3.Blue() : BABYLON.Color3.Red());
        }
    }

    setTransform(matrix) {
        var scaling = BABYLON.Vector3.Zero();
        var rotationQuaternion = BABYLON.Quaternion.Zero();
        var translation = BABYLON.Vector3.Zero();
        
        matrix.clone().decompose(scaling, rotationQuaternion, translation);
        this.chunk.scaling = scaling;
        this.chunk.rotationQuaternion = rotationQuaternion;
        this.chunk.position = translation;
        //this.chunk.setPreTransformMatrix(matrix);
        //var chunkMatrix = this.chunk.getWorldMatrix();
        //chunkMatrix.copyFrom(matrix);
    }
    
    enable() {
        this.chunk.visibility = this.enabledVisibility;
        //this.highlightLayer.isEnabled = true;
    }

    disable() {
        this.chunk.visibility = 0.0;
        //this.highlightLayer.isEnabled = false;
    }
}