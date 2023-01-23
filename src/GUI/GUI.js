import BuildPlaceCreating from "./BuildPlaceCreating";
import Play from "./Play";
import DebugMessage from "./DebugMessage";

export default class GUI {
    constructor(advancedTexture) {
        this.advancedTexture = advancedTexture;
        this.container = new BABYLON.GUI.Container("guiContainer");
        this.container.width = 1;
        this.container.height = 1;
        this.container.background = "transparent";
        this.container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.advancedTexture.addControl(this.container);
        this.play = new Play();
        this.play.setVisible(false);
        this.buildPlaceCreating = new BuildPlaceCreating();
        this.buildPlaceCreating.setVisible(true);
        this.debugMessage = new DebugMessage();
        BABYLON.Tools.Log("After Play");
        this.container.addControl(this.debugMessage.getControl());
        this.debugMessage.setVisible(true);
        this.container.addControl(this.play.getControl());
        this.container.addControl(this.buildPlaceCreating.getControl());
    }

    setPlayVisible(value) {
        this.play.setVisible(value);
    }

    setDebugMessageVisible(value) {
        this.debugMessage.setVisible(value);
    }

    setDebugMessage(msg) {
        this.debugMessage.setText(msg);
    }

    getBuildPlaceCreating() {
        return this.buildPlaceCreating;
    }

    addOnBlockToggleListener(callback) {
        this.play.addOnBlockToggleListener(callback);
    }

    addOnHotbarSelectListener(callback) {
        this.play.addOnHotbarSelectListener(callback);
    }

    addOnBlockPlaceListener(callback) {
        this.play.addOnBlockPlaceListener(callback);
    }

    addOnBlockBreakListener(callback) {
        this.play.addOnBlockBreakListener(callback);
    }

    addOnBlockPlaceDistanceChangeListener(callback) {
        this.play.addOnBlockPlaceDistanceChangeListener(callback);
    }
}