export default class DebugMessage {
    constructor() {

        this.container = new BABYLON.GUI.Container("debugMsg");
        this.container.width = 1;
        this.container.height = 0.3;
        this.container.background = "transparent";
        this.container.top = "20px";
        this.container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

        this.titleRect = new BABYLON.GUI.Rectangle("dbMsgCreatingTitle");
        this.titleRect.width = 0.95;
        this.titleRect.height = "50px";
        this.titleRect.cornerRadius = 10;
        this.titleRect.color = "white";
        this.titleRect.thickness = 2;
        this.titleRect.background = "#EE44EE44";
        this.titleRect.top = "40px";
        this.titleRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        
        this.titleText = new BABYLON.GUI.TextBlock();
        this.titleText.text = "Debug Message";
        this.titleText.color = "white";
        this.titleText.fontSize = 22;
        this.titleRect.addControl(this.titleText);
        this.container.addControl(this.titleRect);
    }

    getControl() {
        return this.container;
    }
    setText(text) {
        this.titleText.text = text;
    }

    setVisible(value) {
        this.container.isVisible = value;
    }
}