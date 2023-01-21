
const strReplaceAll = function (str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

const ab2str = function (buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

const assetIdPathCleanup = function (assetId) {
    BABYLON.Tools.Log("In asset id path cleanup");
    var assetCleaned = assetId.includes(":") ? assetId.split(":")[1] : assetId;
    BABYLON.Tools.Log("In asset id path cleanup 2");
    assetCleaned = "block/" + strReplaceAll(assetCleaned, "/", "_");
    BABYLON.Tools.Log("In asset id path cleanup 3");
    return assetCleaned;
}

const assetLoader = function (assetPath, callback) {
    BABYLON.Tools.Log("In asset loader " + assetPath);
    const req = new XMLHttpRequest();
    req.responseType = "text";
    BABYLON.Tools.Log("xhttp");
    req.addEventListener("loadend", () => {
        BABYLON.Tools.Log("eventlisten in resp");
        var resp = req.responseText;
        if (resp) {
            BABYLON.Tools.Log("resp not empty, bl=" + resp.byteLength + ",lth=" + resp.length);
            //var respStr = ab2str(resp);
            var respStr = resp;
            callback(respStr);
            BABYLON.Tools.Log("after load asset");
        }
    });
    req.open("GET", "app:///assets/" + assetPath + ".gltf");
    req.send();
}

export default class AssetManager {

    constructor(scene) {
        this.scene = scene;
        this.loadedAssets = {};
        this.loadedInstancesCount = {};
        this.loadedInstances = {};
        this.waitingForAsset = {};
        this.loadingAsset = [];
        this.defaultPivot = new BABYLON.Vector3(0.5, 0.5, 0.5);
        this.defaultInstancePosition = BABYLON.Matrix.Identity();
        this.defaultRotation = BABYLON.Quaternion.FromEulerAngles(0, -Math.PI / 2, 0);
        this.freeInstances = {};
    }

    addAssetInstance(assetId, callback) {
        var instanceId = "";
        if (assetId in this.loadedAssets) {
            if (assetId in this.freeInstances && this.freeInstances[assetId].length > 0) {
                var instanceId = this.freeInstances[assetId].shift();
                callback(instanceId);
            } else {
                instanceId = assetId + this.loadedInstancesCount[assetId]++;
                this.loadedInstances[instanceId] = [];
                for (var ms in this.loadedAssets[assetId]) {
                    var newInstance = this.loadedAssets[assetId][ms].thinInstanceAdd(this.defaultInstancePosition, true);//.createInstance(instanceId);
                    //newInstance.setPivotPoint(this.defaultPivot, BABYLON.Space.LOCAL);
                    this.loadedInstances[instanceId].push(newInstance);
                }
            }
            callback(instanceId);
        } else if (this.loadingAsset.indexOf(assetId) != -1) {
            if (assetId in this.waitingForAsset) {
                this.waitingForAsset[assetId].push(callback);
            } else {
                this.waitingForAsset[assetId] = [callback];
            }
        }
        else {
            BABYLON.Tools.Log("In loading asset");
            //TODO : bulk loading to prevent id collision when loading same asset multiple times
            this.loadingAsset.push(assetId);
            this.waitingForAsset[assetId] = [];
            BABYLON.Tools.Log("Before import mesh");
            //app:///assets" + assetIdPathCleanup(assetId) + ".gltf
            assetLoader(assetIdPathCleanup(assetId), function (assetData) {

                BABYLON.Tools.Log("Before import mesh MASYNC");
                BABYLON.SceneLoader.ImportMesh("", "", "data:" + assetData, this.scene, function (newMeshesA) {
                    BABYLON.Tools.Log("In import mesh");
                    console.log(newMeshesA);
                    newMeshesA.shift();
                    //var meshC = BABYLON.Mesh.MergeMeshes(newMeshesA, true, true, undefined, false, true);
                    //meshC.createNormals(false);
                    //meshC.material.backFaceCulling = false;
                    //newMeshes[0];
                    //meshC.setParent(null);
                    // Make the "root" mesh not visible. The instanced versions of it that we
                    // create below will be visible.
                    //var newMeshes = [meshC];
                    var newMeshes = newMeshesA;

                    this.loadedAssets[assetId] = newMeshes;
                    instanceId = assetId + 0;
                    this.loadedInstancesCount[assetId] = 1;
                    this.loadedInstances[instanceId] = [];
                    for (var ms in newMeshes) {
                        var mesh = newMeshes[ms];
                        //newMeshes[ms].setPivotPoint(this.defaultPivot, BABYLON.Space.LOCAL);
                        mesh.position.set(0, 0, 0);
                        mesh.rotationQuaternion = BABYLON.Quaternion.Identity();
                        mesh.scaling.set(1, 1, 1);
                        //newMeshes[ms].physicsImpostor = new BABYLON.PhysicsImpostor(newMeshes[ms], BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0.01}, this.scene);
                        //newMeshes[ms].checkCollisions = true;
                        var newInstance = mesh.thinInstanceAdd(this.defaultInstancePosition, true);
                        //.createInstance(instanceId);
                        //newInstance
                        this.loadedInstances[instanceId].push(newInstance);
                        mesh.isVisible = true;
                    }

                    callback(instanceId);

                    for (var cb in this.waitingForAsset[assetId]) {
                        instanceId = assetId + this.loadedInstancesCount[assetId]++;
                        this.loadedInstances[instanceId] = [];
                        for (var ms in this.loadedAssets[assetId]) {
                            var newInstance = this.loadedAssets[assetId][ms].thinInstanceAdd(this.defaultInstancePosition, true);//.createInstance(instanceId);
                            this.loadedInstances[instanceId].push(newInstance);
                        }
                        this.waitingForAsset[assetId][cb](instanceId);
                    }
                    delete this.waitingForAsset[assetId];
                    //this.loadingAsset.splice(assetIdIndex, 1);
                }.bind(this));
            }.bind(this));
        }
    }

    //setWorldPositionAssetInstance(assetId, instanceId, position) {
    setAssetInstanceTransform(assetId, instanceId, position, quaternion, rootMatrix) {
        //console.log(assetId, instanceId, position, quaternion, rootMatrix.getTranslation());
        
        var rotMatBlock = BABYLON.Matrix.Identity();
        BABYLON.Matrix.FromQuaternionToRef(quaternion, rotMatBlock);
        var offsetMatrix = BABYLON.Matrix.Translation(this.defaultPivot.x, this.defaultPivot.y, this.defaultPivot.z);
        var blockMatrix = offsetMatrix.multiply(rotMatBlock).multiply(BABYLON.Matrix.Translation(position.x, position.y, position.z)).multiply(rootMatrix);
        
        var rotMat = BABYLON.Matrix.Identity();
        var translate = new BABYLON.Vector3();
        position.rotateByQuaternionAroundPointToRef(quaternion, position.add(this.defaultPivot), translate);
        BABYLON.Matrix.FromQuaternionToRef(quaternion, rotMat);
        var tmpMultMatrix = rotMat.multiply(BABYLON.Matrix.Translation(translate.x - 0.5, translate.y - 0.5, translate.z - 0.5));
        for (var ms in this.loadedAssets[assetId]) {
            this.loadedAssets[assetId][ms].thinInstanceSetMatrixAt(this.loadedInstances[instanceId][ms], tmpMultMatrix.multiply(rootMatrix));
        }
        return tmpMultMatrix;
        /*
        for(var inst in this.loadedInstances[instanceId]) {
            this.loadedAssets[assetId][ms].thinInstanceSetMatrixAt(this.loadedInstances[instanceId][inst]).translate(new BABYLON.Vector3(1, 0, 0), position.x, Space.WORLD);
            this.loadedInstances[instanceId][inst].translate(new BABYLON.Vector3(0, 1, 0), position.y, Space.WORLD);
            this.loadedInstances[instanceId][inst].translate(new BABYLON.Vector3(0, 0, 1), position.z, Space.WORLD);
        }
        */
    }

    rotateAssetInstance(instanceId, axis, amount, space) {
        for (var inst in this.loadedInstances[instanceId]) {
            this.loadedInstances[instanceId][inst].rotate(axis, amount, space);
        }
    }
    removeAssetInstance(assetId, instanceId) {
        BABYLON.Tools.Log("In rm asset instance " + assetId + " " + instanceId);
        for (var ms in this.loadedAssets[assetId]) {
            BABYLON.Tools.Log("In loop");
            this.loadedAssets[assetId][ms].thinInstanceSetMatrixAt(this.loadedInstances[instanceId][ms], BABYLON.Matrix.Scaling(0, 0, 0));
        }
        if (assetId in this.freeInstances) this.freeInstances[assetId].push(instanceId);
        else this.freeInstances[assetId] = [instanceId];
    }

    /*
    removeAssetInstance(instanceId) {
        for(var inst in this.loadedInstances[instanceId]) {
            this.loadedInstances[instanceId][inst].dispose();
        }
    }*/

    setPhysicsImpostorAssetInstance(position, quaternion) {

        var box = BABYLON.MeshBuilder.CreateBox("box", { width: 1, height: 1, depth: 1 }, this.scene);
        //transform.decompose(BABYLON.Vector3.Zero(), box.rotationQuaternion, box.position);
        box.setParent()
        box.rotationQuaternion = quaternion.clone();
        box.position.copyFrom(position.add(this.defaultPivot));
        box.rotateAround(BABYLON.Vector3.Zero(), BABYLON.Axis.Y, -Math.PI / 2);
        box.isVisible = false;
        box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.01 }, this.scene);

        box.checkCollisions = true;

        /*
        this.loadedInstances[instanceId].physicsImpostor = new BABYLON.PhysicsImpostor(this.loadedInstances[instanceId],
                        BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.01});
                        */
    }

}