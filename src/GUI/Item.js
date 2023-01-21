import Itemstates from "../itemstates.json";

export default class Item {
    constructor(itemId) {
        this.itemId = itemId;
        this.item = BABYLON.GUI.Button.CreateSimpleButton("itemBut", Itemstates[itemId]["displayName"]);
        this.item.width = "50px"
        this.item.height = "50px";
        this.item.color = "white";
        this.item.cornerRadius = 20;
        this.item.fontSize = 14;
        this.item.background = "gray";
    }

    getControl() {
        return this.item;
    }

    getId() {
        return this.itemId;
    }

    setSelected(value) {
        this.item.background = value ? "rgb(80, 80, 220)" : "gray";
    }

    addOnTouchListener(callback) {
        this.item.onPointerUpObservable.add(
            function() {
                callback(this);
            }.bind(this));
    }
    

}