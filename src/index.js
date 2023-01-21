
//Game entry point
import Game from "./Game";

const ar = true;
const xrHitTest = false;

var game;
var engine = new BABYLON.NativeEngine();
var scene = new BABYLON.Scene(engine);
scene.useRightHandedSystem = true;
BABYLON.Tools.LoadFile("app:///droidsans.ttf", (data) => {
    BABYLON.Tools.Log("before font load");
    _native.Canvas.loadTTFAsync("droidsans", data).then(function () {
        BABYLON.Tools.Log("on font load");
        initAll();
    });
}, undefined, undefined, true);

BABYLON.Tools.Log("Before create box");

var initAll = function () {
    BABYLON.Mesh.CreateBox("box1", 0.2, scene);
    BABYLON.Tools.Log("Loaded");

    // This creates and positions a free camera (non-mesh)
    scene.createDefaultCamera(true, true, true);
    scene.activeCamera.alpha += Math.PI;

    //var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    /*
    var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Click Me");
    button1.width = "150px"
    button1.height = "40px";
    button1.color = "white";
    button1.cornerRadius = 20;
    button1.background = "green";
    button1.onPointerUpObservable.add(function() {
        BABYLON.Mesh.CreateBox("box2", 0.5, scene);
    });
    advancedTexture.addControl(button1); 
    */

    scene.createDefaultLight(true);

        //TODO: Move network logic in appropriate class
        /*
        var rtcInstance = null;
        var wsStarted = false;
        const WS_URL = "ws://90.16.68.220:25560";
        const myName = "Merryviaphone";

        const wsConnection = new RTCWebsocket(WS_URL);
        const rtcConnection = new RTCConnection(myName, wsConnection);

        rtcConnection.addOnDataChannelOpenListener(function (channelId) {
            BABYLON.Tools.Log("RTC DC Open! " + channelId);
            this.rtcConnection.sendMessage(channelId, "Hello! " + channelId);
        }.bind({rtcConnection: rtcConnection}));

        rtcConnection.addOnMessageListener((channelId, msg) => {
            BABYLON.Tools.Log("RTC DC MSG! " + channelId + ": " + msg);
            
        });

        //TODO: move geo logic too
        var retEarth = window.navigator.xr.GEO_getEarthQuaternionLatitudeLongitude();
        BABYLON.Tools.Log("EarthObj " + retEarth.lat + " " + retEarth.lon);
        */
    
    BABYLON.Tools.Log("Before game instance");
    game = new Game(scene.activeCamera, scene, engine);
    BABYLON.Tools.Log("After game instance");
    
    /*
    engine.runRenderLoop(function () {
        scene.render();
    });
    */

    if (ar) {
        BABYLON.Tools.Log("In AR");
        setTimeout(function () {
            scene.createDefaultXRExperienceAsync({ disableDefaultUI: true, disableTeleportation: true }).then((xr) => {
                BABYLON.Tools.Log("In scene AR");
                const xrHitTestModule = xr.baseExperience.featuresManager.enableFeature(
                    BABYLON.WebXRFeatureName.HIT_TEST,
                    "latest",
                    { offsetRay: { origin: { x: 0, y: 0, z: 0 }, direction: { x: 0, y: 0, z: -1 } }, entityTypes: ["mesh", "plane"] });
                game.addHitTestModule(xrHitTestModule);
                if (xrHitTest) {
                    BABYLON.Tools.Log("In scene hitTest");
                    // Create the hit test module. OffsetRay specifies the target direction, and entityTypes can be any combination of "mesh", "plane", and "point".
                    const xrHitTestModule = xr.baseExperience.featuresManager.enableFeature(
                        BABYLON.WebXRFeatureName.HIT_TEST,
                        "latest",
                        { offsetRay: { origin: { x: 0, y: 0, z: 0 }, direction: { x: 0, y: 0, z: -1 } }, entityTypes: ["mesh"] });

                    // When we receive hit test results, if there were any valid hits move the position of the mesh to the hit test point.
                    
                    /*
                    xrHitTestModule.onHitTestResultObservable.add((results) => {
                        if (results.length) {
                            scene.meshes[0].position.x = results[0].position.x;
                            scene.meshes[0].position.y = results[0].position.y;
                            scene.meshes[0].position.z = results[0].position.z;
                        }
                    });
                    */
                }
                else {
                    setTimeout(function () {
                        scene.meshes[0].position.z = 2;
                        scene.meshes[0].rotate(BABYLON.Vector3.Up(), 3.14159);
                    }, 5000);
                }
                xr.baseExperience.enterXRAsync("immersive-ar", "unbounded", xr.renderTarget).then((xrSessionManager) => {
                    BABYLON.Tools.Log("On enter XR async");
                    game.setXRAvailable(true);
                    
                    /*
                    if (hololens) {
                        // Pass through, head mounted displays (HoloLens 2) require autoClear and a black clear color
                        xrSessionManager.scene.autoClear = true;
                        xrSessionManager.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
                    }
                    */
                });
            });
        }, 5000);
    }


    //TODO: Could be useful to project text in game such as player usernames
    /*
    if (text) {
        var Writer = BABYLON.MeshWriter(scene, { scale: 1.0, defaultFont: "Arial" });
        new Writer(
            "Lorem ipsum dolor sit amet...",
            {
                "anchor": "center",
                "letter-height": 5,
                "color": "#FF0000"
            }
        );
    }
    */

}