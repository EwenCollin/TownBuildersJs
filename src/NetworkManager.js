import { RTCConnection, RTCWebsocket } from "./RTC";

export default class NetworkManager {
    constructor(playerName, wsUrl) {
        this.wsUrl = wsUrl;// "ws://90.16.68.220:25560";
        this.playerName = playerName;

        this.wsConnection = new RTCWebsocket(this.wsUrl);

        BABYLON.Tools.Log("Before add on close listener ws");
        this.wsConnection.addOnCloseListener(function() {
            BABYLON.Tools.Log("WEBSOCKET CLOSED!");
            this.wsConnection.open();
        }.bind(this));
        BABYLON.Tools.Log("After add on close listener ws");
        
        this.rtcConnections = [];

        this.rtcReady = [];
        this.rtcChannel = [];

        this.rtcChannelIndex = 0;

        this.onRTCMessageCallbacks = [];

        this.onKeyframeCallbacks = [];

        this.getKeyframe = null;

        //this.addRTCConnection();


    }

    setGetKeyframe(callback) {
        BABYLON.Tools.Log("getKeyframe set");
        BABYLON.Tools.Log(JSON.stringify({"keyframe": callback()}));
        this.getKeyframe = callback;
    }

    addRTCConnection() {
        BABYLON.Tools.Log("addRTCConnection " + this.rtcChannelIndex);
        var rtcConnection = new RTCConnection(this.playerName, this.wsConnection, this.rtcChannel);
        this.rtcConnections.push(rtcConnection);
        this.rtcChannel.push(null);
        this.rtcReady.push(false);

        rtcConnection.addOnDataChannelOpenListener(function (chId, channelId) {
            this.rtcReady[chId] = true;
            this.rtcChannel[chId] = channelId;
            BABYLON.Tools.Log("RTC DC Open! chId:" + chId + ", channelId:" + channelId);
            //if (!this.rtcConnections[chId].getHand() && this.getControlPlayerAt(this.rtcChannelIndex - 2) == this.playerName) {
            // Force keyframe sending for each player
            BABYLON.Tools.Log("RTC DC Open! chId can send msg " + this.getKeyframe().length);
                this.rtcConnections[chId].sendMessage(this.rtcChannel[chId],
                    JSON.stringify(
                    {
                        "from": this.playerName,
                        "to": this.rtcChannel[chId],
                        "keyframe": this.getKeyframe(),
                    }));
                BABYLON.Tools.Log("RTC DC after pre send");
            //}
            setTimeout(this.addRTCConnection.bind(this), 100);
            //this.rtcConnection.sendMessage(channelId, "Hello! " + channelId);
        }.bind(this, this.rtcChannelIndex));
        
        rtcConnection.addOnMessageListener(function (chId, channelId, msg) {
            BABYLON.Tools.Log("RTC DC On msg listener");
            var loadedMsg = JSON.parse(msg);
            if("keyframe" in loadedMsg) {
                for(var cbId in this.onKeyframeCallbacks) {
                    BABYLON.Tools.Log("RTC DC Before keyframe");
                    this.onKeyframeCallbacks[cbId](loadedMsg["keyframe"]);
                }
            }
            else if ("to" in loadedMsg && (loadedMsg["to"] == "any" || loadedMsg["to"] == this.playerName)) {
                for(var cbId in this.onRTCMessageCallbacks) {
                    BABYLON.Tools.Log("RTC DC Before on message");
                    this.onRTCMessageCallbacks[cbId](loadedMsg["event"]);
                }
            }
            BABYLON.Tools.Log("RTC DC MSG! " + chId + ":" + channelId + ": " + msg);
        }.bind(this, this.rtcChannelIndex));
        this.rtcChannelIndex++;
    }

    getControlPlayer() {
        if (this.rtcChannelIndex == 0) return this.playerName;
        BABYLON.Tools.Log("RTC DC before get control player");
        return this.rtcConnections[this.rtcChannelIndex - 1].getHand() ? this.rtcChannel[this.rtcChannelIndex - 1] : this.playerName;
    }
    getControlPlayerAt(index) {
        BABYLON.Tools.Log("RTC DC get player at");
        if (index < 1) return this.playerName;
        BABYLON.Tools.Log("RTC DC get player at if ok");
        return this.rtcConnections[index].getHand() ? this.rtcChannel[index] : this.playerName;
    }

    addGameEventListener(callback) {
        this.onRTCMessageCallbacks.push(callback);
    }

    addKeyframeListener(callback) {
        this.onKeyframeCallbacks.push(callback);
    }

    sendEventTo(channelId, eventData) {
        var message = {
            "from": this.playerName,
            "to": channelId,
            "event" : eventData,
        }
        var payload = JSON.stringify(message);
        var chId = this.rtcChannel.indexOf(channelId);
        if ((chId >= 0) && (this.rtcReady.length < chId) && this.rtcReady[chId]) {
            this.rtcConnections[chId].sendMessage(this.rtcChannel[chId], payload);
        }
        
    }

    sendEventToAll(eventData) {
        var message = {
            "from": this.playerName,
            "to": "any",
            "event" : eventData,
        };
        var payload = JSON.stringify(message);
        for (var chId in this.rtcReady) {
            if (this.rtcReady[chId]) {
                this.rtcConnections[chId].sendMessage(this.rtcChannel[chId], payload);
            }
        }

    }

    
}