export default class Geospatial{
    constructor(camera, screenWidthPx, screenHeightPx) {
        this.camera = camera;
        this.screenWidthPx = screenWidthPx;
        this.screenHeightPx = screenHeightPx;
        this.trackedAnchors = {};
        this.enabled = false;
        this.hitTestModule = null;
        this.lastHitTestPosition = BABYLON.Vector3.Zero();

        this.hitTestUpdateCallback = [];
    }

    addOnHitTestUpdateCallback(callback) {
        this.hitTestUpdateCallback.push(callback);
    }

    setCamera(camera) {
        this.camera = camera;
    }

    setHitTestModule(hitTestModule) {
        this.hitTestModule = hitTestModule;
        this.hitTestModule.onHitTestResultObservable.add(function (results) {
            if (results.length) {
                for (var cbId in this.hitTestUpdateCallback) {
                    this.hitTestUpdateCallback[cbId]();
                }
                //BABYLON.Tools.Log("HTRES Hit test result, x=" + results[0].position.x);
                this.lastHitTestPosition.set(results[0].position.x, results[0].position.y, results[0].position.z);
            }
        }.bind(this));
    }

    setEnabled(value) {
        this.enabled = value;
    }

    addEarthAnchor(anchorName, quaternion, latitude, longitude, altitude) {
        //BABYLON.Tools.Log("in AEA");
        if (!this.enabled) return null;
        //BABYLON.Tools.Log("in AEA enabled");
        const result = window.navigator.xr.GEO_addEarthAnchor(anchorName, quaternion.x, quaternion.y, quaternion.z, quaternion.w, latitude, longitude, altitude);
        //BABYLON.Tools.Log("in AEA enabled success test");
        if (!result["success"]) return null;
        //BABYLON.Tools.Log("in AEA enabled success test ok");
        this.trackedAnchors[anchorName] = true;
        return true;
    }
    
    hitTestEarthAnchor(anchorName) {
        //BABYLON.Tools.Log("in htea");
        if(!this.enabled || !this.hitTestModule) return null;
        //BABYLON.Tools.Log("in htea enabled");
        var euler = this.camera.rotationQuaternion.toEulerAngles();
        var quat= BABYLON.Quaternion.FromEulerAngles(0, euler.y, 0);
        var pos = this.lastHitTestPosition;
        //BABYLON.Tools.Log("before geo_ call");
        const result = window.navigator.xr.GEO_addLocalEarthAnchor(anchorName, quat.x, quat.y, quat.z, quat.w, pos.x, pos.y, pos.z);
        //BABYLON.Tools.Log("after geo_ call");
        if (!result["success"]) return null;
        //BABYLON.Tools.Log("GEOPOS: x=" + pos.x + ", y=" + pos.y + ", z=" + pos.z);
        this.trackedAnchors[anchorName] = true;
        return {quaternion: new BABYLON.Quaternion(result["qx"], result["qy"], result["qz"], result["qw"]),
        latitude: result["lat"], longitude: result["lon"], altitude: result["alt"]};
    }

    /*
    hitTestEarthAnchor(anchorName, tap_x, tap_y) {
        if (!this.enabled) return null;
        if (anchorName in this.trackedAnchors) return null;
        BABYLON.Tools.Log("Before geo_");
        if (!tap_x || !tap_y) {
            tap_x = this.screenWidthPx/2;
            tap_y = this.screenHeightPx/2;
        }
        BABYLON.Tools.Log("Before geo_" + tap_x + "," + tap_y);
        const result = window.navigator.xr.GEO_hitTestEarthAnchor(anchorName, tap_x, tap_y);
        BABYLON.Tools.Log("After geo_");
        if (!result["success"]) return null;
        this.trackedAnchors[anchorName] = true;
        return {quaternion: new BABYLON.Quaternion(result["qx"], result["qy"], result["qz"], result["qw"]),
        latitude: result["lat"], longitude: result["lon"], altitude: result["alt"]};
    }
    */

    removeEarthAnchor(anchorName) {
        if (!this.enabled) return null;
        if (anchorName in this.trackedAnchors) {
            window.navigator.xr.GEO_removeEarthAnchor(anchorName);
            delete this.trackedAnchors[anchorName];
        }
    }

    getEarthAnchorPose(anchorName) {
        if (!this.enabled) return null;
        if (anchorName in this.trackedAnchors) {
            var matrixArray = [];
            var camMatrixArray = [];
            //BABYLON.Tools.Log("before earth anchor_ call");
            const result = window.navigator.xr.GEO_getEarthAnchorPose(anchorName);
            //BABYLON.Tools.Log("after earth anchor_ call");
            for (var i = 0; i < 16; i++) {
                matrixArray.push(result["m" + i]);//(((i%4)*4)+Math.floor(i/4))]);
                camMatrixArray.push(result["c" + i]);
            }
            // Column major
            var sceneCamMatrix = this.camera.computeWorldMatrix();
            var diffMatrix = BABYLON.Matrix.FromArray(camMatrixArray).invert().multiply(sceneCamMatrix);
            return BABYLON.Matrix.FromArray(matrixArray);//.multiply(diffMatrix);
        }
        return BABYLON.Matrix.Identity();
    }

    //TODO: implement native anchoring/geospatial methods

}