export default class BuildPlaceCreating {
    constructor() {
        // Important: BabylonNative does not support rgba parsing, use #RRGGBBAA instead.


        this.container = new BABYLON.GUI.Container("buildPlaceCreatingContainer");
        this.container.width = 1;
        this.container.height = 0.8;
        this.container.background = "transparent";
        this.container.top = "20px";
        this.container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

        
        this.titleRect = new BABYLON.GUI.Rectangle("bPCreatingTitle");
        this.titleRect.width = 0.7;
        this.titleRect.height = "50px";
        this.titleRect.cornerRadius = 20;
        this.titleRect.color = "white";
        this.titleRect.thickness = 2;
        this.titleRect.background = "#4444EE44";
        //this.titleRect.top = "40px";
        this.titleRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        
        this.titleText = new BABYLON.GUI.TextBlock();
        this.titleText.text = "Build Place position preview";
        this.titleText.color = "white";
        this.titleText.fontSize = 24;
        this.titleRect.addControl(this.titleText);
        
        this.container.addControl(this.titleRect);
        

        this.placeButton = BABYLON.GUI.Button.CreateSimpleButton("placeBut", "Place!");
        this.placeButton.width = 0.6;
        this.placeButton.height = "40px";
        this.placeButton.color = "white";
        this.placeButton.background = "rgb(80, 220, 80)";
        this.placeButton.cornerRadius = 14;
        this.placeButton.top = "-90px";
        this.placeButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.container.addControl(this.placeButton);

        this.cancelButton = BABYLON.GUI.Button.CreateSimpleButton("cancelBut", "Cancel");
        this.cancelButton.width = 0.6;
        this.cancelButton.height = "40px";
        this.cancelButton.color = "white";
        this.cancelButton.background = "rgb(220, 80, 80)";
        this.cancelButton.cornerRadius = 14;
        this.cancelButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.cancelButton.bottom = "0px";
        this.container.addControl(this.cancelButton);
    }

    setVisible(value) {
        this.container.isVisible = value;
    }

    getControl() {
        return this.container;
    }


    setPlaceEnabled(value) {
        this.placeButton.isEnabled = value;
    }

    addOnCancelListener(callback) {
        this.cancelButton.onPointerUpObservable.add(callback);
    }

    addOnPlaceListener(callback) {
        this.placeButton.onPointerUpObservable.add(callback);
    }



}