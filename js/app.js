var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var canvas = document.getElementById("cv-app");
var renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Custom global variables
var mouse = {x: 0, y: 0};

// Spotlight shining from the side, casting a shadow
var spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(100, 1000, 100);

spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

scene.add(spotLight);

var pointLight = new THREE.PointLight('red', 55, 18);
pointLight.position.set(2, -2, 3);
scene.add(pointLight);

var sphereSize = 1;
var pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
// scene.add( pointLightHelper );

var bluepointLight = new THREE.PointLight('blue', 20, 14);
bluepointLight.position.set(-2, -2, 2);
scene.add(bluepointLight);

var sphereSize = 1;
var bluepointLightHelper = new THREE.PointLightHelper(bluepointLight, sphereSize);
// scene.add( bluepointLightHelper );

var yellowLight = new THREE.PointLight('yellow', 3, 6);
yellowLight.position.set(mouse.x, mouse.y, 5);
scene.add(yellowLight);

// Ambient light.
var light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

var banner = new Banner();
var banner = banner.get();
scene.add(banner);

camera.position.z = 10;

var animate = function () {
    requestAnimationFrame(animate);
    render();
    renderer.render(scene, camera);
};

function render() {
    // banner.rotation.x += 0.005;
    var millisInMinute = Date.now() % 60000;
    var millisInMinuteNormalized = millisInMinute / 60000;
    bluepointLight.position.y = 4 * Math.sin(4 * millisInMinuteNormalized * Math.PI * 2);
    pointLight.position.y = 5 * Math.cos(3 * millisInMinuteNormalized * Math.PI * 2);
}

window.addEventListener('resize', onWindowResize, false);
document.addEventListener('mousemove', onMouseMove, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onMouseMove(event) {
    var eventDoc, doc, body;

    event = event || window.event; // IE-ism

    // Update the mouse variable
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    //yellowLight.position.x = mouse.x;
    //yellowLight.position.y = mouse.y;
    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	vector.unproject( camera );
	var dir = vector.sub( camera.position ).normalize();
	var distance = - camera.position.z / dir.z;
	var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
	yellowLight.position.copy(pos);
    // console.log(mouse);
}

animate();