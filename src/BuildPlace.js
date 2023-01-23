import Chunk from "./Chunk";

export default class BuildPlace {

    static blockScale = 0.75;

    constructor(assetManager, eventManager, geospatial) {
        this.geospatial = geospatial;
        this.eventManager = eventManager;
        this.assetManager = assetManager;
        this.chunks = [];
        //this.baseRootTransform = BABYLON.Matrix.Translation(Chunk.chunkSize/2, 0, Chunk.chunkSize/2).multiply(BABYLON.Matrix.Scaling(this.blockScale, this.blockScale, this.blockScale));
        this.translationOffset = BABYLON.Matrix.Translation(-Chunk.chunkSize/2, -1.0, -Chunk.chunkSize/2);//Chunk.chunkSize/2, -2.0, Chunk.chunkSize/2);
        this.baseRootTransform = this.translationOffset.clone().multiply(BABYLON.Matrix.Scaling(BuildPlace.blockScale, BuildPlace.blockScale, BuildPlace.blockScale));
        //this.translationOffset.setTranslationFromFloats(-Chunk.chunkSize/4, -1.2, -Chunk.chunkSize/4);
        this.rootTransform = this.baseRootTransform.clone();
        this.anchorName = null;
        this.eventManager.addEventDataListener(this.applyEvent.bind(this));
        this.anchorRootMatrix = BABYLON.Matrix.Identity();
    }

    anchorTimeout(anchorName, ad) {
        BABYLON.Tools.Log("BuildPlace anchor timeout");
        var result = this.geospatial.addEarthAnchor(anchorName, BABYLON.Quaternion.Zero().copyFromFloats(ad[0], ad[1], ad[2], ad[3]), ad[4], ad[5], ad[6]);
        BABYLON.Tools.Log("After result");
        if (result) this.setAnchor(anchorName);
        else setTimeout(this.anchorTimeout.bind(this, anchorName, ad), 100);
    }

    applyEvent(eventData) {
        if (eventData["type"] == "anchor" && this.anchorName == null) {
            var anchorName = "networkBPAnchor";
            var ad = eventData["payload"]["anchor"];

            BABYLON.Tools.Log("in htea enabled");
            this.anchorTimeout(anchorName, ad);
        }
    }

    makeAnchorEvent(quaternion, latitude, longitude, altitude) {
        var eventData = {
            "type": "anchor",
            "payload": {
                "anchor": [quaternion.x, quaternion.y, quaternion.z, quaternion.w, latitude, longitude, altitude],
            }
        };
        this.eventManager.addEvent(eventData);
    }

    updateRootTransform(matrix) {
        //var translationVec = matrix.getTranslation();
        //this.anchorRootMatrix.copyFrom(matrix);
        //this.rootTransform.copyFrom(this.baseRootTransform.clone().multiply(BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI/4)));
        this.rootTransform.copyFrom(this.baseRootTransform.clone().multiply(matrix));//.multiply(BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI)));//BABYLON.Matrix.Translation(translationVec.x, translationVec.y, translationVec.z)));//matrix));
        for (var chunkId in this.chunks) {
            this.chunks[chunkId].updateRootTransform(this.rootTransform);
        }
    }

    getAnchor() {
        return this.anchorName;
    }

    setAnchor(anchorName) {
        this.anchorName = anchorName;
    }

    worldVectorToBlockMatrix(vector, floor) {
        //var coords = BABYLON.Vector3.TransformCoordinates(vector, this.rootTransform).floor();
        var translationMat = BABYLON.Matrix.Translation(vector.x, vector.y, vector.z);
        //var matInv = this.rootTransform.clone().invert();
        //BABYLON.Tools.Log("End game instance matInv=" + matInv.m[0] + ","+ matInv.m[5] + " initVector=" + vector.toString());

        if (!floor) return this.rootTransform.clone().setTranslation(BABYLON.Vector3.Zero()).multiply(translationMat);
        var localTranslationFloor = translationMat.multiply(this.rootTransform.clone().invert()).getTranslation();
        return BABYLON.Matrix.Translation(Math.round(localTranslationFloor.x), Math.round(localTranslationFloor.y), Math.round(localTranslationFloor.z)).multiply(this.rootTransform.clone());//.multiply(this.anchorRootMatrix.clone().invert());
        //BABYLON.Matrix.Identity().setTranslation(localTranslationFloor).multiply(this.rootTransform.clone());
    }

    worldVectorToBlockPosition(vector) {
        var translationMat = BABYLON.Matrix.Translation(vector.x, vector.y, vector.z);
        var localVec = translationMat.multiply(this.rootTransform.clone().invert()).getTranslation();
        return vector.set(Math.round(localVec.x), Math.round(localVec.y), Math.round(localVec.z));
    }

    setBlock(position, id, blockstate) {
        position.y = position.y < 0 ? 0 : position.y;
        var chunk_x = Math.floor(position.x / Chunk.chunkSize);
        var chunk_z = Math.floor(position.z / Chunk.chunkSize);
        var chunk = this.getChunk(chunk_x, chunk_z);
        BABYLON.Tools.Log("BuildPlace setBlock! x=" + chunk_x + ",z=" + chunk_z);
        if (!chunk) return false;
        BABYLON.Tools.Log("BuildPlace before chunk set block");
        return chunk.setBlock(position, id, blockstate);
    }

    getBlock(position) {
        BABYLON.Tools.Log("BuildPlace before get block " + position.x);
        position.y = position.y < 0 ? 0 : position.y;
        var chunk_x = Math.floor(position.x / Chunk.chunkSize);
        var chunk_z = Math.floor(position.z / Chunk.chunkSize);
        var chunk = this.getChunk(chunk_x, chunk_z);
        BABYLON.Tools.Log("BuildPlace getBlock! x=" + chunk_x + ",z=" + chunk_z);
        if (!chunk) return false;
        BABYLON.Tools.Log("BuildPlace before chunk set block");
        var localPosition = {
            x: position.x % Chunk.chunkSize,
            y: position.y % Chunk.chunkHeight,
            z: position.z % Chunk.chunkSize };
        return chunk.getBlock(position);
    }

    getChunk(pos_x, pos_z) {
        for (var chunkId in this.chunks) {
            var chunkPos = this.chunks[chunkId].getPosition();
            BABYLON.Tools.Log("Get chunk x=" + chunkPos.x + ",z=" + chunkPos.z);
            if (chunkPos.x == pos_x && chunkPos.z == pos_z) return this.chunks[chunkId];
        }
        BABYLON.Tools.Log("Get chunk not found");
        return null;
    }

    removeChunk(pos_x, pos_z) {
        for (var chunkId in this.chunks) {
            var chunkPos = this.chunks[chunkId].getPosition();
            if (chunkPos.x == pos_x && chunkPos.z == pos_z) return this.chunks.splice(chunkId, 1);
        }
        return [];
    }

    addChunk(pos_x, pos_z) {
        BABYLON.Tools.Log("in add chunk");
        if (!this.getChunk(pos_x, pos_z)) {
            BABYLON.Tools.Log("After this get chunk");
            var newChunk = new Chunk(pos_x, pos_z, this.assetManager, this.rootTransform.clone());
            BABYLON.Tools.Log("After new chunk");
            this.chunks.push(newChunk);
            return newChunk;
        }
        return null;
    }
}