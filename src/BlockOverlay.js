export default class BlockOverlay {

    constructor() {
        this.block = BABYLON.MeshBuilder.CreateBox("blockOverlay");
        this.block.visibility = 0;
        this.enabledVisibility = 0.5;
        //this.highlightLayer = new BABYLON.HighlightLayer("hl1");
        //this.highlightLayer.addMesh(this.block, BABYLON.Color3.Blue());
    }

    setTransform(matrix) {
        //BABYLON.Tools.Log("In set transform");
        //var blockMatrix = this.block.getWorldMatrix();
        var scaling = BABYLON.Vector3.Zero();
        var rotationQuaternion = BABYLON.Quaternion.Zero();
        var translation = BABYLON.Vector3.Zero();
        //BABYLON.Tools.Log("Set vars");
        matrix.clone().decompose(scaling, rotationQuaternion, translation);
        
        //this.block.setPreTransformMatrix(matrix);
        //BABYLON.Tools.Log("End game instance trVector=" + translation.toString());
        //BABYLON.Tools.Log("Decompose");
        this.block.scaling = scaling;
        //BABYLON.Tools.Log("Decompose 1");
        this.block.rotationQuaternion = rotationQuaternion;
        //BABYLON.Tools.Log("Decompose 2");
        this.block.position = translation;
        //BABYLON.Tools.Log("Decompose 3");
        //blockMatrix.copyFrom(matrix);
    }
    
    enable() {
        this.block.visibility = this.enabledVisibility;
        //this.highlightLayer.isEnabled = true;
    }

    disable() {
        this.block.visibility = 0.0;
        //this.highlightLayer.isEnabled = false;
    }
}