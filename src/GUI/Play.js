import BlockControls from "./BlockControls";
import Hotbar from "./Hotbar";

export default class Play {

    constructor() {
        this.container = new BABYLON.GUI.Container("playContainer");
        this.container.width = 1;
        this.container.height = 0.8;
        this.container.background = "transparent";
        this.container.top = "20px";
        this.container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        BABYLON.Tools.Log("After container");
        this.panel = new BABYLON.GUI.StackPanel();
        this.panel.width = "150px";
        this.panel.background = "transparent";
        this.panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        BABYLON.Tools.Log("After stack attr");
        this.container.addControl(this.panel);
        BABYLON.Tools.Log("After stack panel");

        this.blockControls = new BlockControls(this.panel);
        BABYLON.Tools.Log("After block controls");

        this.hotbar = new Hotbar();
        this.container.addControl(this.hotbar.getControl());
        BABYLON.Tools.Log("After hotbar");
    }

    setVisible(value) {
        this.container.isVisible = value;
    }

    getControl() {
        return this.container;
    }

    addOnHotbarSelectListener(callback) {
        this.hotbar.addOnItemSelectListener(callback);
    }

    addOnBlockPlaceListener(callback) {
        this.blockControls.addOnPlaceListener(callback);
    }

    addOnBlockBreakListener(callback) {
        this.blockControls.addOnBreakListener(callback);
    }

    addOnBlockPlaceDistanceChangeListener(callback) {
        this.blockControls.addOnBlockDistanceChangeListener(callback);
    }

}