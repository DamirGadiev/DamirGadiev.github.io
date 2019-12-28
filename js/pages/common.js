var scene = new THREE.Scene();
scene.background = new THREE.Color('#e7e7e7');
var canvas = document.getElementById("card-coordinates");
var camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.width, 0.1, 1000);
console.log(canvas.width);
var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.gammaFactor = 2.2;
renderer.gammaOutput = true;
var geometry = new THREE.BoxGeometry(10, 10, 10);
var material = new THREE.MeshLambertMaterial({ color: 'grey', side: THREE.FrontSide,
shadowSide: THREE.FrontSide });
var cube = new THREE.Mesh(geometry, material);
cube.receiveShadow = true;
cube.castShadow = true;
cube.geometry.computeVertexNormals();
scene.add(cube);

// Spotlight shining from the side, casting a shadow
var spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(100, 1000, 100);

spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 5;
scene.add(spotLight);

camera.position.z = 25;
camera.position.y = -3;

var animate = function () {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.001;
    cube.rotation.y += 0.008;

    renderer.render(scene, camera);
};

animate();