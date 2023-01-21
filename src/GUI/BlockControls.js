export default class BlockControls {
    constructor(panel) {
        this.panel = panel;

        this.breakButton = BABYLON.GUI.Button.CreateSimpleButton("breakBut", "Break");
        this.breakButton.width = 0.3;
        this.breakButton.height = "40px";
        this.breakButton.color = "white";
        this.breakButton.background = "rgb(220, 80, 80)";
        this.panel.addControl(this.breakButton);

        this.placeButton = BABYLON.GUI.Button.CreateSimpleButton("placeBut", "Place");
        this.placeButton.width = 0.3;
        this.placeButton.height = "40px";
        this.placeButton.color = "white";
        this.placeButton.background = "rgb(80, 220, 80)";
        this.panel.addControl(this.placeButton);

        this.header = new BABYLON.GUI.TextBlock();
        this.header.text = "Block range: 2";
        this.header.height = "30px";
        this.header.color = "white";
        this.panel.addControl(this.header);

        this.slider = new BABYLON.GUI.Slider();
        this.slider.minimum = 2;
        this.slider.maximum = 10;
        this.slider.isVertical = true;
        this.slider.value = 2;
        this.slider.height = "300px";
        this.slider.width = "30px";
        this.slider.isThumbCircle = true;
        this.slider.thumbWidth = "33px";
        this.slider.step = 1;
        this.slider.color = "rgb(80,80,200)";
        this.slider.background = "gray";
        this.slider.isThumbClamped = false;
        this.slider.onValueChangedObservable.add(function (value) {
            this.header.text = "Block range: " + value;
        }.bind(this));
        this.panel.addControl(this.slider);
    }

    addOnPlaceListener(callback) {
        this.placeButton.onPointerUpObservable.add(callback);
    }

    addOnBreakListener(callback) {
        this.breakButton.onPointerUpObservable.add(callback);
    }


    addOnBlockDistanceChangeListener(callback) {
        this.slider.onValueChangedObservable.add(callback);
    }


}