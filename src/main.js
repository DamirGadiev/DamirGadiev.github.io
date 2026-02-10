import * as THREE from 'three';

class App {
    constructor() {
        this.container = document.getElementById('canvas-container');

        // Scene Setup
        this.scene = new THREE.Scene();

        // Camera Setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Initial Objects
        this.addObjects();
        this.addLights();

        // Events
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Start Render Loop
        this.clock = new THREE.Clock();
        this.animate();
    }

    addObjects() {
        // Background Stars
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 5000; i++) {
            vertices.push(THREE.MathUtils.randFloatSpread(100)); // x
            vertices.push(THREE.MathUtils.randFloatSpread(100)); // y
            vertices.push(THREE.MathUtils.randFloatSpread(100)); // z
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);

        // Placeholder Geometric Object
        const meshGeometry = new THREE.IcosahedronGeometry(1, 1);
        const meshMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.9,
            thickness: 0.5,
        });
        this.mesh = new THREE.Mesh(meshGeometry, meshMaterial);
        this.scene.add(this.mesh);
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 15);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const time = this.clock.getElapsedTime();

        // Subtle animations
        if (this.mesh) {
            this.mesh.rotation.x = time * 0.2;
            this.mesh.rotation.y = time * 0.3;
        }

        if (this.stars) {
            this.stars.rotation.y = time * 0.05;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

new App();
