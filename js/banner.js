console.log("Banner logic started");

function Banner() {
    this.construct();
    this.build();
}

Banner.prototype.construct = function() {
    this.loader = new THREE.TextureLoader();
}

/**
 * Build the banner.
 */
Banner.prototype.build = function() {
    var planeGeometry = new THREE.PlaneGeometry(40, 20, 80, 80);
    // Wall texture.
    var texture = this.texture('/img/wall.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 8, 8 );
    // Wall normal map.
    var normalMap = this.texture('/img/wallmap.png');
    var planeMaterial = new THREE.MeshLambertMaterial( { map: texture, color: '#022615' } );
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    // rotate and position the plane
    plane.rotation.x = 0;
    plane.position.set(0,0,-2);
    this.banner = plane;
};

/**
 * Get banner result.
 */
Banner.prototype.get = function() {
    return this.banner;
}

/**
 * Apply texture.
 */
Banner.prototype.texture = function(path) {
    return this.loader.load(path);
}
