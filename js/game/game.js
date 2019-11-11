/**
 * Game runner class.
 */
function Game(name) {
    this.construct(name);
}

/**
 * @constructor
 */
Game.prototype.construct = function(name) {
    this.name = name;
    // Holder for the THREE.js scene.
    this.scene = {};
    // Holder for the user influenced states.
    this.state = {
        player: []
    }
}

/**
 * Add scene
 * Wrapper around three.js scene object.
 */
Game.prototype.addScene = function () {
    try {
        this.scene = new THREE.Scene();
        console.log('%cGame. scene initiated.', 'background: green; color: white;');
    }
    catch (e) {
        console.log(e);
        console.log('%cGame. scene initiation failed.', 'background: red; color: white;');
    }
};

/**
 * Adds a camera to the application.
 */
Game.prototype.addCamera = function() {
    try {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 10;
        console.log('%cGame. camera initiated.', 'background: green; color: white;');
    }
    catch (e) {
        console.log(e);
        console.log('%cGame. camera initiation failed.', 'background: red; color: white;');
    }
}

/**
 * Adds a player to the application.
 */
Game.prototype.addRenderer = function(canvasId) {
    try {
        var canvas = document.getElementById(canvasId);
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        console.log('%cGame. Renderer initiated.', 'background: green; color: white;');
    }
    catch (e) {
        console.log(e);
        console.log('%cGame. Rendered was not created.', 'background: red; color: white;');
    }
}

/**
 * Add game light.
 */
Game.prototype.addLight = function() {
    // Ambient light.
    var light = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(light);

    var pointLight = new THREE.PointLight('red', 55, 18);
    pointLight.position.set(2, -2, 3);
    this.scene.add(pointLight);

    var bluepointLight = new THREE.PointLight('blue', 20, 14);
    bluepointLight.position.set(-2, -2, 2);
    this.scene.add(bluepointLight);
}

/**
 * Load the world.
 */
Game.prototype.addWorld = function() {
    // Add a world.
    try {
        this.world = new World(this);
        this.world.init();
        console.log('%cGame. World was created.', 'background: green; color: white;');
    }
    catch(e) {
        console.log(e);
        console.log('%cGame. World was not created.', 'background: red; color: white;');
    }
}

/**
 * Game render method, main client game loop lives here.
 */
Game.prototype.render = function () {
    // Save game object.
    var that = this;
    var render = function () {
        // Time loop
        requestAnimationFrame(render);
        // Call scene updates to render them.
        that.update();
        // Render updated scene.
        that.renderer.render(that.scene, that.camera);
    };
    render();
};

/**
 * Update actions.
 */
Game.prototype.update = function () {
    
}

/**
 * Game init function.
 */
Game.prototype.init = function() {
    this.addScene();
    this.addCamera();
    this.addRenderer('game-app');
    this.addLight();    
}
