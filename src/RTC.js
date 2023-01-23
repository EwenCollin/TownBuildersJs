
const RTC = window.navigator.rtc;

class RTCWebsocket {
    constructor(url) {
        this.url = url;
        this.isOpen = false;
        this.isOpening = false;

        RTC.onWebsocketOpen(function (wsData) {

            if (wsData["wsUrl"]) {
                this.isOpen = true;
                this.isOpening = false;
            }
        }.bind(this));

        RTC.onWebsocketClosed(function (wsData) {
            BABYLON.Tools.Log("RTC Calling back from ws open rtc check");
            if (wsData["wsUrl"] == this.url) {
                this.isOpen = false;
                this.isOpening = false;
            }
        }.bind(this));
    }

    getOpenState() {
        return this.isOpen;
    }
    getOpeningState() {
        return this.isOpening;
    }
    getUrl() {
        return this.url;
    }

    open() {
        if (!this.isOpen && !this.isOpening) {
            this.isOpening = true;
            RTC.openWebsocket(this.url);
            return true;
        }
        return false;
    }

    close() {
        if (this.isOpen && !this.isOpening) {
            RTC.closeWebsocket(this.url);
            return true;
        }
        return false;
    }

    sendMessage(message) {
        if (this.isOpen && !this.isOpening) {
            RTC.sendWebsocketMessage(this.url, message);
        }
    }

    addOnOpenListener(callback) {
        RTC.onWebsocketOpen(function (wsData) {
            BABYLON.Tools.Log("RTC Calling back from ws open rtc check cb");
            BABYLON.Tools.Log("RTC Calling back from ws open rtc check cb val myUrl=" + this.myUrl);
            if (wsData["wsUrl"] == this.myUrl) {
                BABYLON.Tools.Log("Calling back from ws open");
                this.callback();
            }
        }.bind({ myUrl: this.url, callback: callback }));
    }

    addOnCloseListener(callback) {
        BABYLON.Tools.Log("Add On close listener");
        RTC.onWebsocketClosed(function (wsData) {
            BABYLON.Tools.Log("On websocket closed !");
            if (wsData["wsUrl"] == this.myUrl) {
                this.callback();
            }
        }.bind({ myUrl: this.url, callback: callback }));
    }

    addOnMessageListener(callback) {
        RTC.onWebsocketMessage(function (wsData) {
            BABYLON.Tools.Log("RTC WS message rcv!");
            if (wsData["wsUrl"] == this.myUrl) {
                BABYLON.Tools.Log("RTC WS message rcv cb!");
                this.callback(wsData["message"]);
            }
        }.bind({ myUrl: this.url, callback: callback }));
    }

}

class RTCConnection {

    constructor(identifier, websocket, existingChannels) {

        RTC.setConfig("90.16.68.220"); //custom stun server set

        this.existingChannels = existingChannels;

        this.identifier = identifier;
        this.websocket = websocket;

        if (!this.websocket.getOpenState() || !this.websocket.getOpeningState()) {
            this.websocket.open();
        }

        this.remoteDescriptions = {};
        // peerId: [{added: boolean, payload: {sdp: sdp string, type: type string}}]

        this.remoteCandidates = {};
        // peerId: [{added: boolean, payload: {candidate: candidate string, mid: candidate mid string}}]



        this.peerConnectionReady = {};


        this.websocketReady = this.websocket.getOpenState();

        //TODO: add close/fail callbacks...


        RTC.onPeerConnectionCreated(function (pcData) {
            if (this.dataChannelOpen) return;
            var id = pcData["id"];
            this.peerConnectionReady[id] = true;
            BABYLON.Tools.Log("RTC PC on create! " + id);
            this.flushRemoteDescriptions(id);
            BABYLON.Tools.Log("RTC PC remote candidates! " + id);
            this.flushRemoteCandidates(id);
            BABYLON.Tools.Log("RTC PC remote candidates after! " + id);
        }.bind(this));

        this.dataChannels = {};

        RTC.onDataChannel(function (dcData) {
            if (this.dataChannelOpen) return;
            BABYLON.Tools.Log("RTC DC OPEN f!");
            this.dataChannelOpen = true;
            this.dataChannels[dcData["channelId"]] = true;
            BABYLON.Tools.Log("RTC MSG " + dcData["channelId"] + " is here!");
        }.bind(this));

        RTC.onRemoteDescriptionSet(function (pcData) {
            if (this.dataChannelOpen) return;
            BABYLON.Tools.Log("RTC onRemoteDescription set " + pcData["id"]);
            this.flushRemoteCandidates(pcData["id"]);
        }.bind(this));

        RTC.onLocalDescription(function (descData) {
            if (this.dataChannelOpen) return;
            BABYLON.Tools.Log("RTC On local description");
            var type = descData["type"];
            var sdp = descData["sdp"];

            //We have to send it over websocket to connect to peer
            if (this.websocketReady) {
                var msgToSend = {
                    "client": this.identifier,
                    "to": this.remoteChannelName,
                    "type": type,
                    "payload": {
                        "sdp": sdp,
                    }
                };
                this.websocket.sendMessage(JSON.stringify(msgToSend));
            }
        }.bind(this));
        RTC.onLocalCandidate(function (candidateData) {
            if (this.dataChannelOpen) return;
            BABYLON.Tools.Log("RTC On local candidate");
            var candidate = candidateData["candidate"];
            var mid = candidateData["mid"];

            //We have to send it over websocket to connect to peer
            if (this.websocketReady) {
                var msgToSend = {
                    "client": this.identifier,
                    "to": this.remoteChannelName,
                    "type": "candidate",
                    "payload": {
                        "candidate": candidate,
                        "mid": mid,
                    }
                };
                this.websocket.sendMessage(JSON.stringify(msgToSend));
            }

        }.bind(this));



        this.websocket.addOnOpenListener(function () {
            //if (this.dataChannelOpen) return;
            BABYLON.Tools.Log("RTC ws add on open rtc conn ok!");
            this.websocketReady = true;
            this.websocket.sendMessage(JSON.stringify({ "type": "register", "client": this.identifier, "payload": {} }));
        }.bind(this));

        this.websocket.addOnCloseListener(function () {
            BABYLON.Tools.Log("Before add on close listener rtc");
            this.websocketReady = false;
        }.bind(this));

        this.websocket.addOnMessageListener(this.onWebsocketMessage.bind(this));
        //this.websocket.open();

        this.hasHand = false;
        this.dataChannelOpen = false;

        this.remoteChannelName = null;
    }

    autoRegister() {
        if(!this.dataChannelOpen) {
            if (this.websocketReady) {
                this.websocket.sendMessage(JSON.stringify({ "type": "register", "client": this.identifier, "payload": {} }));
            }
            setTimeout(this.autoRegister.bind(this), 500);
        }
    }

    getHand() {
        return this.hasHand;
    }


    flushRemoteCandidates(id) {
        //Check if remote description exists already for that peer, otherwise would not be able to process candidate
        BABYLON.Tools.Log("RTC PC set remCand start" + id);
        var remDescExists = this.remoteDescriptions.hasOwnProperty(id);
        BABYLON.Tools.Log("RTC PC set remCand remDescExists" + remDescExists);
        var remDescNotEmpty = remDescExists && (this.remoteDescriptions[id].length > 0);
        BABYLON.Tools.Log("RTC PC set remCand remDescNotEmpty" + remDescNotEmpty);

        //BABYLON.Tools.Log("RTC remCand" + this.peerConnectionReady[id] + ":" + remDescNotEmpty + ":" + this.remoteDescriptions[id][0]["added"]);
        if (this.peerConnectionReady[id] && remDescNotEmpty && this.remoteDescriptions[id][0]["added"]) {
            BABYLON.Tools.Log("RTC PC set remCand allowed to add " + id);
            var rmCandidatesArray = this.remoteCandidates[id];
            for (var candNb in rmCandidatesArray) {
                var rmCand = rmCandidatesArray[candNb];
                if (!rmCand["added"]) {
                    var candidate = rmCand["payload"]["candidate"];
                    var mid = rmCand["payload"]["mid"];
                    BABYLON.Tools.Log("RTC PC set remCand" + id);
                    RTC.setRemoteCandidate(id, candidate, mid);
                    BABYLON.Tools.Log("RTC PC after set remCand" + id);
                    rmCand["added"] = true;
                }
            }
        }
    }

    flushRemoteDescriptions(id) {
        if (this.peerConnectionReady[id] && id in this.remoteDescriptions) {
            var rmDescriptionsArray = this.remoteDescriptions[id];
            for (var descNb in rmDescriptionsArray) {
                var rmDesc = rmDescriptionsArray[descNb];
                if (!rmDesc["added"]) {
                    var sdp = rmDesc["payload"]["sdp"];
                    var msgType = rmDesc["payload"]["type"];
                    BABYLON.Tools.Log("RTC PC set remDesc" + id);
                    RTC.setRemoteDescription(id, sdp, msgType);
                    BABYLON.Tools.Log("RTC PC after set remDesc" + id);
                    rmDesc["added"] = true;
                    this.remoteDescriptions[id][descNb]["added"] = true;

                }
            }
        }
    }

    appendRemoteData(appendTo, rmId, data) {
        if (!(rmId in appendTo)) appendTo[rmId] = [];
        appendTo[rmId].push(
            {
                "added": false,
                "payload": data,
            }
        )
    }


    onWebsocketMessage(message) {
        var msgData = JSON.parse(message);
        var clientName = msgData["client"];
        var msgType = msgData["type"];
        var msgPayload = msgData["payload"];
        BABYLON.Tools.Log("WSMSG: " + JSON.stringify({
            "dcOpen": this.dataChannelOpen,
            "remDescs": this.remoteDescriptions,
            "clientName": clientName
        }));
        if (this.dataChannelOpen || (this.existingChannels.indexOf(clientName) != -1)) return;
        BABYLON.Tools.Log("WSMSG accepted");

        if (clientName != this.identifier) {
            // We only pay attention to other client messages
            if (msgType == "register" && !this.remoteChannelName) {
                this.hasHand = true;
                this.remoteChannelName = clientName;
                RTC.createDataChannel(clientName, clientName);
            }
            if (msgType == "offer" && msgData["to"] == this.identifier) {
                // We are offered to start a connection with peer "clientName".
                this.remoteChannelName = clientName;
                RTC.startPeerConnection(clientName);
            }
            if ((msgType == "offer" || msgType == "answer") && msgData["to"] == this.identifier) {
                // We can set the description of remote peer "clientName".
                BABYLON.Tools.Log("RTC PC remoteDesc set! " + msgType);
                //RTC.setRemoteDescription(clientName, msgPayload["sdp"], msgType);
                if (Object.keys(this.remoteDescriptions).indexOf(clientName) == -1) {
                    this.appendRemoteData(this.remoteDescriptions, clientName, { "sdp": msgPayload["sdp"], "type": msgType });
                    BABYLON.Tools.Log("RTC PC after set! " + msgType);
                    this.flushRemoteDescriptions(clientName);
                    BABYLON.Tools.Log("RTC PC after flush remDesc! " + msgType);
                }
            }
            if (msgType == "candidate" && msgData["to"] == this.identifier) {
                if (Object.keys(this.remoteDescriptions).indexOf(clientName) != -1) {
                    this.appendRemoteData(this.remoteCandidates, clientName, { "candidate": msgPayload["candidate"], "mid": msgPayload["mid"] });
                    this.flushRemoteCandidates(clientName);
                    BABYLON.Tools.Log("RTC PC after flush remCand! " + msgType);
                }
            }
        }
    }

    addOnDataChannelOpenListener(callback) {
        RTC.onDataChannel(function (callback, dcData) {
            BABYLON.Tools.Log("RTC PC OPEN!");
            if (this.remoteChannelName != null && this.remoteChannelName == dcData["channelId"]) {
                callback(dcData["channelId"]);
            }
        }.bind(this, callback));
        //RTC.sendMessage(channelId, "Incredible! " + channelId + "? Do you copy? It's " + myName + ". Over!");
    };

    sendMessage(peerId, message) {
        if (peerId in this.dataChannels) RTC.sendMessage(peerId, message);
    }

    addOnMessageListener(callback) {
        RTC.onMessage(function (callback, dcData) {
            BABYLON.Tools.Log("RTC on msg listener here");
            BABYLON.Tools.Log("RTC on msg listener " + JSON.stringify(dcData));
            var channelId = dcData["channelId"];
            var msg = dcData["message"];
            
            if (this.remoteChannelName != null && this.remoteChannelName == dcData["channelId"]) {
                callback(channelId, msg);
            }
        }.bind(this, callback));
    }

}

export { RTCWebsocket, RTCConnection };