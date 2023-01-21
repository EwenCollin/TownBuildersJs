export default class BuildPlacePlacing {

    static anchorTest = "anchorTest";

    constructor(buildPlaceCreating, geospatial, chunkOverlay, currentAnchorName, gui) {
        this.currentAnchorName = currentAnchorName;
        this.gui = gui;
        this.buildPlaceCreating = buildPlaceCreating;
        this.geospatial = geospatial;
        this.chunkOverlay = chunkOverlay;
        this.lastHitTest = null;
        this.onPlaceListeners = [];
        this.onCancelListeners = [];
        this.lastPoseMatrix = null;
        
        this.buildPlaceCreating.addOnPlaceListener(function() {
            for(var cbId in this.onPlaceListeners) {
                this.onPlaceListeners[cbId](this.lastHitTest, this.currentAnchorName);
            }
        }.bind(this));
        
        this.buildPlaceCreating.addOnCancelListener(function() {
            for(var cbId in this.onCancelListeners) {
                this.onCancelListeners[cbId]();
            }
        }.bind(this));

        this.newHitTestAvailable = false;
        this.geospatial.addOnHitTestUpdateCallback(function() {
            this.newHitTestAvailable = true;
        }.bind(this));

        this.enabled = false;
    }

    setCurrentAnchorName(newName) {
        this.currentAnchorName = newName;
    }

    isEnabled() {
        return this.enabled;
    }

    addOnPlaceListener(callback) {
        this.onPlaceListeners.push(callback);
    }

    addOnCancelListener(callback) {
        this.onCancelListeners.push(callback);
    }

    update() {
        if (this.newHitTestAvailable) {
            this.newHitTestAvailable = false;
            this.geospatial.removeEarthAnchor(this.currentAnchorName);
            //BABYLON.Tools.Log("After rm EA");
            
            //var hitTest = this.geospatial.addEarthAnchor(this.currentAnchorName, BABYLON.Quaternion.Identity(), 48.84848554835387, 2.325747585560568, 72);
            var hitTest = this.geospatial.hitTestEarthAnchor(this.currentAnchorName);
            //BABYLON.Tools.Log("After hittest ea");
            this.lastHitTest = hitTest ? hitTest : this.lastHitTest;
        }
        if (this.lastHitTest) {
            var poseMatrix = this.geospatial.getEarthAnchorPose(this.currentAnchorName);
            //BABYLON.Tools.Log("After get EA pose");
            this.chunkOverlay.setCanPlace(true);
            this.buildPlaceCreating.setPlaceEnabled(true);
            this.chunkOverlay.setTransform(poseMatrix);
            var tr = poseMatrix.getTranslation();
            //BABYLON.Tools.Log("Bef posemsg");
            var posMsg = "X: " + Number.parseFloat(tr.x).toFixed(2).toString() + ", Y: " + Number.parseFloat(tr.y).toFixed(2).toString() + ", Z: " + Number.parseFloat(tr.z).toFixed(2).toString();
            //posMsg += "\n, lat: " + Number.parseFloat(this.lastHitTest.latitude).toFixed(5).toString()
            //posMsg += ", lon: " + Number.parseFloat(this.lastHitTest.longitude).toFixed(5).toString()
            //posMsg += ", alt: " + Number.parseFloat(this.lastHitTest.altitude).toFixed(3).toString()
            //BABYLON.Tools.Log("After posemsg");
            this.gui.setDebugMessage(posMsg);
            //BABYLON.Tools.Log("After ch Overlay set transform");
            return;
        }
        //BABYLON.Tools.Log("After if hittest");
        this.chunkOverlay.setCanPlace(false);
        this.buildPlaceCreating.setPlaceEnabled(false);
    }

    start() {
        this.buildPlaceCreating.setVisible(true);
        this.chunkOverlay.enable();
        this.enabled = true;
    }

    stop() {
        this.buildPlaceCreating.setVisible(false);
        this.chunkOverlay.disable();
        this.enabled = false;
    }
}