import Item from "./Item";
import Itemstates from "../itemstates.json";

export default class Hotbar {
    static itemCount = 7;
    static lineCount = 3;
    constructor() {
        this.hotbar = new BABYLON.GUI.Grid();   
        this.hotbar.background = "red"; 
        this.hotbar.width = 1;
        this.hotbar.height = "180px";
        this.hotbar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.hotbar.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        
        for (var i = 0; i < Hotbar.itemCount; i++) {
            this.hotbar.addColumnDefinition(1/Hotbar.itemCount);
        }
        for (var i = 0; i < Hotbar.lineCount; i++) {
            this.hotbar.addRowDefinition(1/Hotbar.lineCount);
        }
        
        this.itemSelectCallbacks = [];

        this.items = [];

        BABYLON.Tools.Log("Before hotbar set default");
        this.fillDefaultHotbar();

    }

    onTouch(item) {
        for(var itId in this.items) {
            this.items[itId].setSelected(false);
        }
        item.setSelected(true);
        for(var cbId in this.itemSelectCallbacks) {
            this.itemSelectCallbacks[cbId](item.getId());
        }
    }

    fillDefaultHotbar() {
        //var itemIds = Itemstates.keys();
        var i = 0;
        for (var itId in Itemstates) {
            if (i < Hotbar.itemCount*Hotbar.lineCount) {
                BABYLON.Tools.Log("Before item 1 " + itId + " " + i);
                var item = new Item(itId);
                BABYLON.Tools.Log("Before item 2 " + i);
                this.hotbar.addControl(item.getControl(), Math.floor(i/Hotbar.itemCount), i%Hotbar.itemCount);
                BABYLON.Tools.Log("Before item 3 " + i);
                item.addOnTouchListener(this.onTouch.bind(this));
                BABYLON.Tools.Log("Before item 4 " + i);
                this.items.push(item);
            }
            i++;
        }
        /*
        var stoneItem = new Item("stone");
        this.hotbar.addControl(stoneItem.getControl(), 0, 0);
        var bricksItem = new Item("bricks");
        this.hotbar.addControl(bricksItem.getControl(), 0, 1);
        var glassItem = new Item("glass");
        this.hotbar.addControl(glassItem.getControl(), 0, 2);
        var oakPlanksItem = new Item("oak_planks");
        this.hotbar.addControl(oakPlanksItem.getControl(), 0, 3);
        var oakDoorItem = new Item("stone_bricks");
        this.hotbar.addControl(oakDoorItem.getControl(), 0, 4);
        var oakLogItem = new Item("quartz_block");
        this.hotbar.addControl(oakLogItem.getControl(), 0, 5);
        var oakLeavesItem = new Item("copper_block");
        this.hotbar.addControl(oakLeavesItem.getControl(), 0, 6);
        this.items = [stoneItem, bricksItem, glassItem, oakPlanksItem, oakDoorItem, oakLogItem, oakLeavesItem];
        for (var i in this.items) {
            this.items[i].addOnTouchListener(this.onTouch.bind(this));
        }
        */
    }

    getControl() {
        return this.hotbar;
    }

    addOnItemSelectListener(callback) {
        this.itemSelectCallbacks.push(callback);
    }

}