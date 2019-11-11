/**
 * Game world.
 */
function World(game) {
    this.game = game;
}

/**
 * Test mock function.
 */
World.prototype.addTestCube = function() {
    try {
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
        var cube = new THREE.Mesh( geometry, material );
        cube.position.set(0, 0, 0);
        this.game.scene.add(cube)
    }
    catch(e) {
        console.log("%cGame. World was not created.', 'background: red; color: white;");
    }
}

/**
 * Init the world.
 */
World.prototype.init = function() {
    this.addTestCube();
}