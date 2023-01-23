export default class EventManager {
    constructor(playerName, networkManager) {
        BABYLON.Tools.Log("In ev manager");
        this.playerName = playerName;
        this.networkManager = networkManager;
        this.controlPlayer = this.playerName;
        this.eventDataListeners = [];
        this.events = [];
        this.appliedEvents = [];
        this.localEventIndex = 0;
        BABYLON.Tools.Log("In ev manager 2");
        this.networkManager.addGameEventListener(this.addEvent.bind(this));
        BABYLON.Tools.Log("In ev manager 3");
        this.networkManager.addKeyframeListener(this.processKeyframe.bind(this));
        BABYLON.Tools.Log("In ev manager 4");
        this.networkManager.setGetKeyframe(this.getKeyframe.bind(this));
        BABYLON.Tools.Log("In ev manager 5");
    }

    processKeyframe(keyframe) {
        for(var evId in keyframe) {
            this.applyEvent(keyframe[evId]);
        }
    }

    getKeyframe() {
        return this.events;
    }

    addEventDataListener(callback) {
        this.eventDataListeners.push(callback);
    }

    applyEvent(eventData) {
        if (this.appliedEvents.indexOf(eventData["eventId"]) == -1) {
            this.appliedEvents.push(eventData["eventId"]);
            this.events.push(eventData);
            for (var eId in this.eventDataListeners) {
                this.eventDataListeners[eId](eventData);
            }
        }
    }

    sendEvent(eventData) {
        this.networkManager.sendEventToAll(eventData);
    }

    addEvent(eventData) {
        //TODO: Should save own events to resend them if network issue.
        BABYLON.Tools.Log("Adding event");
        if (!("eventId" in eventData)) eventData["eventId"] = this.playerName + "_" + this.localEventIndex++;
        this.controlPlayer = this.networkManager.getControlPlayer();
        this.controlPlayer = this.controlPlayer ? this.controlPlayer : this.playerName;
        BABYLON.Tools.Log("Control Player: " + this.controlPlayer);
        if ((!("confirmed" in eventData)) || eventData["confirmed"] != this.controlPlayer) {
            eventData["confirmed"] = this.playerName;
            BABYLON.Tools.Log("Before send");
            this.sendEvent(eventData);
        }
        BABYLON.Tools.Log("Before apply");
        if (eventData["confirmed"] == this.controlPlayer) {
            this.applyEvent(eventData);
        }
    }
}