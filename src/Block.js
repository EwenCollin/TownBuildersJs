import Blockstates from "./blockstates.json";

const randomVariantSelect = function(variant) {
    return variant.constructor == Object ? variant : variant[Math.floor(Math.random() * variant.length)];
}
const blockStateToString = function(blockState) {
    var retStrings = [];
    for(var state in blockState) {
        retStrings.push(state + "=" + blockState[state]);
    }
    return retStrings.sort().join(",");
}

const checkAgainstValues = function(toCheck, reference) {
    for (var refId in reference) {
        if (!((refId in toCheck) && (toCheck[refId] == reference[refId]))) return false;
    }
    return true;
}

export default class Block {

    constructor(id, metadata, assetManager, rootTransform) {
        //BABYLON.Tools.Log("In block");
        this.assetManager = assetManager;
        this.metadata = metadata;
        this.blockId = id;
        this.instanceIds = [];
        this.blockVariant = [];
        this.rootTransform = rootTransform;
        //BABYLON.Tools.Log("In block create " + this.blockId);
        this.updateTransformCallbacks = [];
        this.disposeAssetCallbacks = [];
        if(this.blockId != "air") this.load();
    }

    updateRootTransform(rootTransform) {
        if (this.blockId != "air") {
            this.rootTransform = rootTransform;
            for( var cbId in this.updateTransformCallbacks) {
                //BABYLON.Tools.Log("Before update block transform");
                this.updateTransformCallbacks[cbId]();
            }
        }
    }

    getId() {
        return this.blockId;
    }
    
    getBlockState() {
        return this.metadata.blockState;
    }

    onUpdateState (blockState) {
        if (this.blockId == "air") return;
        this.metadata.blockState = blockState;
        this.dispose();
        this.load();
    }

    dispose() {
        if (this.blockId == "air") return;
        for (var cbId in this.disposeAssetCallbacks) {
            //BABYLON.Tools.Log("Before remove asset Instance");
            this.disposeAssetCallbacks[cbId]();
        }
    }

    parseBlockVariant(blockVariant) {
        var blockVariantId = this.blockVariant.push(blockVariant) - 1;
        BABYLON.Tools.Log("Before add asset instance");
        this.assetManager.addAssetInstance(blockVariant["model"], function (instanceId) {this.onInstanceLoaded(instanceId, blockVariantId)}.bind(this));
        BABYLON.Tools.Log("After add asset instance");
    }

    onInstanceLoaded(instanceId, blockVariantId) {
        var blockVariant = this.blockVariant[blockVariantId];
        this.instanceIds.push(instanceId);
        //this.assetManager.setWorldPositionAssetInstance(this.blockVariant["model"], instanceId, this.metadata.position)
        var instanceQuaternion = BABYLON.Quaternion.FromEulerAngles("x" in blockVariant ? blockVariant["x"]*Math.PI/180 : 0,
            "y" in blockVariant ? blockVariant["y"]*Math.PI/180 : 0,
            "z" in blockVariant ? blockVariant["z"]*Math.PI/180 : 0);
        var instancePosition = new BABYLON.Vector3(this.metadata.position.x, this.metadata.position.y, this.metadata.position.z);
        this.assetManager.setAssetInstanceTransform(blockVariant["model"], instanceId, instancePosition.clone(), instanceQuaternion.clone(), this.rootTransform.clone());
        BABYLON.Tools.Log("Before ADDBT");

        this.disposeAssetCallbacks.push(function(instanceId, blockVariantId) {
            var blockVariant = this.blockVariant[blockVariantId];
            BABYLON.Tools.Log("Before rm asset via asset mgr");
            this.assetManager.removeAssetInstance(blockVariant["model"], instanceId);
        }.bind(this, instanceId, blockVariantId));

        this.updateTransformCallbacks.push(function(instanceId, blockVariantId) {
            //BABYLON.Tools.Log("In update block transform");
            var blockVariant = this.blockVariant[blockVariantId];
            //BABYLON.Tools.Log("In update block transform 2");
            var instanceQuaternion = BABYLON.Quaternion.FromEulerAngles("x" in blockVariant ? blockVariant["x"]*Math.PI/180 : 0,
                "y" in blockVariant ? blockVariant["y"]*Math.PI/180 : 0,
                "z" in blockVariant ? blockVariant["z"]*Math.PI/180 : 0);
            //BABYLON.Tools.Log("In update block transform 3");
            var instancePosition = new BABYLON.Vector3(this.metadata.position.x, this.metadata.position.y, this.metadata.position.z);
            //BABYLON.Tools.Log("In update block transform 4");
            this.assetManager.setAssetInstanceTransform(blockVariant["model"], instanceId, instancePosition.clone(), instanceQuaternion.clone(), this.rootTransform.clone());
            //BABYLON.Tools.Log("In update block transform 5");
        }.bind(this, instanceId, blockVariantId));
        /*
        if ("x" in blockVariant) this.assetManager.rotateAssetInstance(instanceId, BABYLON.Axis.X, blockVariant["x"]*Math.PI/180, BABYLON.Space.LOCAL);
        if ("y" in blockVariant) this.assetManager.rotateAssetInstance(instanceId, BABYLON.Axis.Y, blockVariant["y"]*Math.PI/180, BABYLON.Space.LOCAL);
        if ("z" in blockVariant) this.assetManager.rotateAssetInstance(instanceId, BABYLON.Axis.Z, blockVariant["z"]*Math.PI/180, BABYLON.Space.LOCAL);
        */
        //this.assetManager.setPhysicsImpostorAssetInstance(instancePosition, instanceQuaternion);
    }

    load() {
        var blockVariants = [];
        console.log(Blockstates, this.blockId);
        if ("variants" in Blockstates[this.blockId]) {
            // The whole model is changing for each variant
            var variants = null;
            if (!("" in Blockstates[this.blockId]["variants"])) {
                var blockStateString = blockStateToString(this.metadata.blockState);
                variants = Blockstates[this.blockId]["variants"][blockStateString];
            } else {
                variants = Blockstates[this.blockId]["variants"][""];
            }
            blockVariants = [randomVariantSelect(variants)];
        } else if ("multipart" in Blockstates[this.blockId]) {
            var blockParts = Blockstates[this.blockId]["multipart"];
            for (var bP in blockParts) {
                if((!("when" in blockParts[bP])) || (checkAgainstValues(this.metadata.blockState, blockParts[bP]["when"]))) {
                    blockVariants.push(randomVariantSelect(blockParts[bP]["apply"]));
                }
            }
        }
        for(var bV in blockVariants) {
            this.parseBlockVariant(blockVariants[bV]);
        }
    }
}