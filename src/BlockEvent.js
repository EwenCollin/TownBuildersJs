export default class BlockEvent {
    constructor(eventManager, buildPlace) {
        this.eventManager = eventManager;
        this.buildPlace = buildPlace;

        this.eventManager.addEventDataListener(this.applyEvent.bind(this));
    }

    makeEvent(position, id, blockstate) {
        var eventData = {
            "type": "block",
            "payload": {
                "position": {
                    // Position could be a BABYLON.Vector3
                    "x": position.x,
                    "y": position.y,
                    "z": position.z
                },
                "id": id,
                "blockstate": blockstate,
            }
        };
        this.eventManager.addEvent(eventData);
    }

    applyEvent(eventData) {
        if (eventData["type"] == "block") {
            var evData = eventData["payload"];
            this.buildPlace.setBlock(evData["position"], evData["id"], evData["blockstate"]);
        }
    }

}