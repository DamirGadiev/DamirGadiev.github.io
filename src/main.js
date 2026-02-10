import * as THREE from 'three';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

class App {
    constructor() {
        this.container = document.getElementById('canvas-container');

        // Scene Setup
        this.scene = new THREE.Scene();

        // Camera Setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 2); // Zooming in closer (was 4)

        // Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Initial Objects
        this.addObjects();
        this.addLights();
        this.initSplat();

        // Events
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Start Render Loop
        this.clock = new THREE.Clock();
        this.animate();
    }

    async initSplat() {
        // The viewer handles the splat rendering and its own internal Three.js scene management
        // but can be integrated into an existing scene.
        this.splatViewer = new GaussianSplats3D.Viewer({
            'selfRenderMode': GaussianSplats3D.RenderMode.External, // We manage the render loop
            'camera': this.camera,
            'renderer': this.renderer,
            'scene': this.scene,
            'antialiased': true,
            'useBuiltInControls': true,
            'splatAlphaRemovalThreshold': 5, // Removes highly transparent splats for better performance
            'freeIntermediateSplatData': true, // Frees memory after loading
        });

        // Load the splat file. Replace '/models/splat.ply' with your actual file path.
        // If you haven't added the file yet, this will gracefully fail or show a log.
        try {
            // Calculate quaternion for 180deg Y and 180deg Z rotation
            const q = new THREE.Quaternion();
            q.setFromEuler(new THREE.Euler(0, Math.PI, Math.PI));

            await this.splatViewer.addSplatScene('/models/splat.ksplat', {
                'progressiveLoad': true,
                'rotation': q.toArray(),
                'scale': [20, 20, 20],
                'position': [0, 0, 0] // Ensure centering at origin
            });
        } catch (e) {
            console.error("Gaussian Splat failed to load. Please ensure your .ply file is at /public/models/splat.ply", e);
        }
    }

    addObjects() {
        // Background Stars
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 5000; i++) {
            vertices.push(THREE.MathUtils.randFloatSpread(100));
            vertices.push(THREE.MathUtils.randFloatSpread(100));
            vertices.push(THREE.MathUtils.randFloatSpread(100));
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: 0x88ccff, size: 0.1, transparent: true, opacity: 0.5 });
        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
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

        if (this.stars) {
            this.stars.rotation.y = time * 0.02;
        }

        // Update splat viewer before rendering
        if (this.splatViewer) {
            this.splatViewer.update();
            this.splatViewer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

new App();
