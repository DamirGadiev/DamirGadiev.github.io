const url = "/js/earth/fragmentShader.frag";
fetch(url)
    .then((response) => {
        return response.text();
    })
    .then((shader) => {
        main(shader);
    });


class Planet {
    constructor(scene, camera, size) {
        // Create the reference to the scene.
        this.scene = scene;
        // Camera
        this.camera = camera;
        // Add the texture loader.
        this.textureLoader = new THREE.TextureLoader();
        // Fix size;
        this.size = size;
        // Build the basic planetary spere.
        this.createSphereGeometry();
        this.createSphereMaterial();
        this.createSphere();
        this.createClouds();
        this.createAtmosphere(0.5, 4, 0x93cfef)
    }

    createAtmosphere(intensity, fade, color) {
        this.createAtmosphereGeometry();
        this.createAtmosphereMaterial(intensity, fade, color);
        this.atmosphere = new THREE.Mesh(this.atmosphereGeometry, this.atmosphereMaterial);
    }

    createAtmosphereGeometry() {
        const size = this.size + (10*this.size/100);
        this.atmosphereGeometry = new THREE.SphereGeometry(size, 32, 32);
    }

    createAtmosphereMaterial(intensity, fade, color) {
        const that = this;
        this.atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: { 
                'c': {
                  type: 'f',
                  value: intensity
                },
                'p': { 
                  type: 'f',
                  value: fade
                },
                glowColor: { 
                  type: 'c',
                  value: new THREE.Color(color)
                },
                viewVector: {
                  type: 'v3',
                  value: that.camera.position
                }
              },
              vertexShader: `
                uniform vec3 viewVector;
                uniform float c;
                uniform float p;
                varying float intensity;
                void main() {
                  vec3 vNormal = normalize( normalMatrix * normal );
                  vec3 vNormel = normalize( normalMatrix * viewVector );
                  intensity = pow( c - dot(vNormal, vNormel), p );
                  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`
              ,
              fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() 
                {
                  vec3 glow = glowColor * intensity;
                  gl_FragColor = vec4( glow, 1.0 );
                }`
              ,
              side: THREE.BackSide,
              blending: THREE.AdditiveBlending,
              transparent: true
        });
    }

    createClouds() {
        const size = this.size + (this.size/100);
        this.cloudsGeometry = new THREE.SphereGeometry(size, 32, 32);
        this.cloudsMaterial = new THREE.MeshPhongMaterial();
        this.loadCloudsTexture();
        this.clouds = new THREE.Mesh(this.cloudsGeometry, this.cloudsMaterial);
    }

    loadCloudsTexture() {
        const that = this;
        this.textureLoader.load(
            '/img/textures/earth_clouds.png',
            function(texture) {
                that.cloudsMaterial.map = texture;
                that.cloudsMaterial.side = THREE.DoubleSide;
                that.cloudsMaterial.opacity = 0.8;
                that.cloudsMaterial.transparent = true;
                that.cloudsMaterial.depthWrite = false;
                that.cloudsMaterial.needsUpdate = true;
            },
            undefined,
            function(err) {
                console.error("An error happened during the planet texture loading.")
            }
        );
    }

    createSphere() {
        this.sphere = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
    }

    createSphereGeometry() {
        this.sphereGeometry = new THREE.SphereGeometry(this.size, 32, 32);
    }

    addSpereTexture() {
        const that = this;
        this.textureLoader.load(
            '/img/textures/earth.jpg',
            function(texture) {
                that.sphereMaterial.map = texture;
                that.sphereMaterial.needsUpdate = true;
            },
            undefined,
            function(err) {
                console.error("An error happened during the planet texture loading.")
            }
        );
    }

    addSphereNormal() {
        const that = this;
        this.textureLoader.load(
            '/img/textures/earth_normal.jpg',
            function(texture) {
                that.sphereMaterial.normalMap = texture;
                that.sphereMaterial.normalScale = new THREE.Vector2(1, 6);
                that.sphereMaterial.needsUpdate = true;
            },
            undefined,
            function(err) {
                console.error("An error happened during the planet normal loading.")
            }
        );
    }

    addSpecularMap() {
        const that = this;
        this.textureLoader.load(
            '/img/textures/specular.png',
            function(texture) {
                that.sphereMaterial.specularMap = texture;
                that.sphereMaterial.needsUpdate = true;
            },
            undefined,
            function(err) {
                console.error("An error happened during the planet specular loading.")
            }
        );
    }

    createSphereMaterial() {
        this.sphereMaterial = new THREE.MeshPhongMaterial();
        this.addSpereTexture();
        this.addSphereNormal();
        this.addSpecularMap();
    }

    view() {
        this.scene.add(this.sphere);
        this.scene.add(this.clouds);
        this.scene.add(this.atmosphere);
    }

}


function main(fragmentShader) {
    // (function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})();
    
    const canvas = document.querySelector('#game-app');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Lights
    let spotLight = new THREE.SpotLight(0xffffff, 1, 0, 10, 2);
    scene.add(spotLight);
        // Light Configurations
    spotLight.position.set(8, -2, 9);

    camera.lookAt(0, 0, 0);

    const earth = new Planet(scene, camera, 2);
    const EARTH_ANGLE = 0.409105177;

    camera.rotation.z = -EARTH_ANGLE;
    camera.position.z = 12;
    camera.position.x = -4;
    camera.position.y = 1.2;
    earth.view();
    earth.sphere.rotation.y = -4 * Math.PI/6;


    var planeGeometry = new THREE.PlaneGeometry(100, 100, 80, 80);
    // Wall texture.
    var texture = new THREE.TextureLoader().load('/img/textures/star.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.set( 4, 2 );

    var planeMaterial = new THREE.MeshLambertMaterial( { map: texture } );
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // rotate and position the plane
    plane.rotation.z = Math.PI / 6;
    plane.position.set(0,0,-20);
    scene.add(plane);

    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener("keydown", onDocumentKeyDown, false);

    function onWindowResize(){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    // movement - please calibrate these values
    var xSpeed = 0.1;
    var ySpeed = 0.1;
    function onDocumentKeyDown(event) {
        var keyCode = event.which;
        if (keyCode == 38) {
            camera.position.y += ySpeed;
            console.log(camera.position.z);
        } else if (keyCode == 40) {
            camera.position.y -= ySpeed;
        } else if (keyCode == 39) {
            camera.position.x -= xSpeed;
        } else if (keyCode == 37) {
            camera.position.x += xSpeed;
        } else if (keyCode == 32) {
            camera.position.set(0, 0, 0);
        }
    }

    var animate = function () {
        requestAnimationFrame(animate);
        earth.sphere.rotation.y += 0.0003;
        earth.clouds.rotation.y += 0.0003;

        renderer.render(scene, camera);
    };

    animate();
}