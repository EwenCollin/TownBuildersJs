import AssetManager from "./AssetManager";
import BlockEvent from "./BlockEvent";
import BlockOverlay from "./BlockOverlay";
import BuildPlace from "./BuildPlace";
import BuildPlacePlacing from "./BuildPlacePlacing";
import ChunkOverlay from "./ChunkOverlay";
import EventManager from "./EventManager";
import Geospatial from "./Geospatial";
import GUI from "./GUI/GUI";
import Itemstates from "./itemstates.json";
import NetworkManager from "./NetworkManager";


function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export default class Game {

    constructor(camera, scene, engine) {
        this.camera = camera;
        this.scene = scene;
        this.engine = engine;
        BABYLON.Tools.Log("After self set");
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        BABYLON.Tools.Log("After dynamic texture");

        BABYLON.Tools.Log("Before makeid");

        this.playerName = makeid(5);

        this.networkManager = new NetworkManager(this.playerName, "ws://90.16.68.220:25560");
        BABYLON.Tools.Log("After network Manager set");
        this.eventManager = new EventManager(this.playerName, this.networkManager);
        BABYLON.Tools.Log("After ev manager set");
        this.networkManager.addRTCConnection();

        this.assetManager = new AssetManager(this.scene);
        this.geospatial = new Geospatial(this.camera, this.engine.getRenderWidth(true), this.engine.getRenderHeight(true));
        this.buildPlace = new BuildPlace(this.assetManager, this.eventManager, this.geospatial);
        BABYLON.Tools.Log("After build place");

        this.blockEvent = new BlockEvent(this.eventManager, this.buildPlace);
        BABYLON.Tools.Log("After block event set");

        this.blockPlaceRange = 2;

        this.gui = new GUI(this.advancedTexture);
        BABYLON.Tools.Log("After GUI");

        BABYLON.Tools.Log("After GUI callback set");


        this.blockOverlay = new BlockOverlay();
        this.blockOverlay.disable();
        BABYLON.Tools.Log("After block overlay");
        BABYLON.Tools.Log("After asset mnger");

        //this.buildPlace = 
        BABYLON.Tools.Log("After geospatial");
        this.chunkOverlay = new ChunkOverlay();
        BABYLON.Tools.Log("After chunk overlay");
        this.buildPlacePlacing = new BuildPlacePlacing(this.gui.getBuildPlaceCreating(), this.geospatial, this.chunkOverlay, "buildPlaceAnchor", this.gui);
        BABYLON.Tools.Log("After build place placing");
        
        this.buildPlacePlacing.addOnCancelListener(function() {
            BABYLON.Tools.Log("Before build place stop");
            this.buildPlacePlacing.stop();
            BABYLON.Tools.Log("Before gui play visible");
            this.gui.setPlayVisible(true);
            BABYLON.Tools.Log("Before gui dbm visible");
            this.gui.setDebugMessageVisible(false);
            BABYLON.Tools.Log("Before block overlay");
            this.blockOverlay.enable();
        }.bind(this));

        this.buildPlacePlacing.addOnPlaceListener(function (lastHitTest, anchorName) {
            this.buildPlacePlacing.stop();
            this.gui.setPlayVisible(true);
            this.gui.setDebugMessageVisible(false);
            this.blockOverlay.enable();
            BABYLON.Tools.Log("Before set anchor");

            this.buildPlace.setAnchor(anchorName);
            this.buildPlace.makeAnchorEvent(lastHitTest.quaternion, lastHitTest.latitude, lastHitTest.longitude, lastHitTest.altitude)
            BABYLON.Tools.Log("After set anchor");
            this.blockEvent.makeEvent({x: 0, y: 0, z: 0}, "emerald_block", {});
            this.blockEvent.makeEvent({x: 7, y: 0, z: 7}, "gold_block", {});
            this.blockEvent.makeEvent({x: 7, y: 0, z: 0}, "diamond_block", {});
            this.blockEvent.makeEvent({x: 0, y: 0, z: 7}, "diamond_block", {});
            BABYLON.Tools.Log("After make event");
            /*
            if (hitTest) {
                var anchorName = "buildPlaceAnchor";
                var addAnchorResult = this.geospatial.addEarthAnchor(anchorName, hitTest.quaternion, hitTest.latitude, hitTest.longitude, hitTest.altitude);
                if (addAnchorResult) {
                    this.buildPlace.setAnchor(anchorName);
                    this.buildPlacePlacing.stop();
                }
            }
            */
        }.bind(this));
        

        //TODO: mark as event in build place
        this.buildPlace.addChunk(0, 0);
        BABYLON.Tools.Log("After add chunk");

        this.currentBuildPosition = BABYLON.Vector3.Zero();
        this.selectedBlock = "air";
        
        this.gui.addOnBlockPlaceDistanceChangeListener(function(value) {
            this.blockPlaceRange = value;
        }.bind(this));
        this.gui.addOnBlockPlaceListener(function() {
            BABYLON.Tools.Log("BuildPlace set bricks! " + this.currentBuildPosition.toString());
            this.blockEvent.makeEvent(this.currentBuildPosition, this.selectedBlock, {});
            BABYLON.Tools.Log("BuildPlace set bricks end!");
        }.bind(this));
        this.gui.addOnBlockBreakListener(function() {
            BABYLON.Tools.Log("BuildPlace set air! " + this.currentBuildPosition.toString());
            this.blockEvent.makeEvent(this.currentBuildPosition, "air", {});
            BABYLON.Tools.Log("BuildPlace set air end!");
        }.bind(this));
        BABYLON.Tools.Log("After ev gui listeners");
        this.gui.addOnHotbarSelectListener(function (itemId) {
            this.selectedBlock = Itemstates[itemId]["blockstate"];
        }.bind(this));
        

        this.xrAvailable = false;
        this.engine.runRenderLoop(this.renderLoop.bind(this));
        BABYLON.Tools.Log("End game instance");
    }

    addHitTestModule(hitTestModule) {
        BABYLON.Tools.Log("Set hit test module");
        this.geospatial.setHitTestModule(hitTestModule);
        BABYLON.Tools.Log("After set hit test module");
    }

    setXRAvailable(value) {
        this.xrAvailable = value;
        this.geospatial.setEnabled(value);
        this.buildPlacePlacing.start();
    }

    renderLoop() {
        this.camera = this.scene.activeCamera;
        this.geospatial.setCamera(this.camera);

        
        if(this.buildPlacePlacing.isEnabled()) {
            //BABYLON.Tools.Log("After place BP isEnabled");
            this.buildPlacePlacing.update();
            //BABYLON.Tools.Log("After place BP update");
        }
        
        var buildPlaceAnchor = this.buildPlace.getAnchor();
        //BABYLON.Tools.Log("After bP anchor");
        if (buildPlaceAnchor) {
            //BABYLON.Tools.Log("BP anchor");
            var earthAnchorPose = this.geospatial.getEarthAnchorPose(buildPlaceAnchor);
            if (earthAnchorPose) {
                //BABYLON.Tools.Log("BP anchor OK");
                this.buildPlace.updateRootTransform(earthAnchorPose.clone());
                this.chunkOverlay.enable();
                this.chunkOverlay.setTransform(earthAnchorPose.clone());
                var tr = earthAnchorPose.getTranslation();
                //BABYLON.Tools.Log("Bef posemsg");
                
            }
        }
        var camDirection = this.camera.getDirection(BABYLON.Vector3.Forward()).normalizeToNew();
        camDirection = camDirection.multiplyByFloats(this.blockPlaceRange, this.blockPlaceRange, this.blockPlaceRange);
        
        //BABYLON.Tools.Log("After set transform " + this.blockPlaceRange + " x=" + camDirection.x + " y=" + camDirection.y);
        camDirection.addInPlace(this.camera.globalPosition);
        //var blockMatrix = BABYLON.Matrix.Translation(camDirection.x, camDirection.y, camDirection.z);//this.buildPlace.worldVectorToBlockMatrix(camDirection);
        //camDirection = camDirection.floor();
        //var camMat = BABYLON.Matrix.Translation(camDirection.x, camDirection.y, camDirection.z).multiply();
        var blockMatrix = this.buildPlace.worldVectorToBlockMatrix(camDirection.clone(), true);
        var scaling = BABYLON.Vector3.Zero();
        var quaternion = BABYLON.Quaternion.Zero();
        var translation = BABYLON.Vector3.Zero();
        //blockMatrix.decompose(scaling, quaternion, translation);
        //BABYLON.Tools.Log("End game instance tx=" + translation.x + " sx=" + scaling.x);
        this.currentBuildPosition = this.buildPlace.worldVectorToBlockPosition(camDirection.clone());
        var tr = this.currentBuildPosition;
        var posMsg = "X: " + Number.parseFloat(tr.x).toFixed(2).toString() + ", Y: " + Number.parseFloat(tr.y).toFixed(2).toString() + ", Z: " + Number.parseFloat(tr.z).toFixed(2).toString();
        this.gui.setDebugMessageVisible(true);
        this.gui.setDebugMessage(posMsg);
        this.blockOverlay.setTransform(blockMatrix);
        //BABYLON.Tools.Log("After block overlay handle");

        //BABYLON.Tools.Log("After bP transform");
        this.scene.render();
        //BABYLON.Tools.Log("After render");
    }



}