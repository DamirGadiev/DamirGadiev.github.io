import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

class App {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.init();
        this.createCrystalUniverse();
        this.addBackgroundStars();
        this.setupPostProcessing(); // New Step
        this.resize();
        this.setupResize();
        this.render();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = null;

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
        this.camera.position.z = 10;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.container.appendChild(this.renderer.domElement);

        // Lighting (Global) - Brighter ambient for visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(-5, 5, 10);
        this.scene.add(dirLight);

        // Additional fill light
        const fillLight = new THREE.DirectionalLight(0x8899ff, 0.4);
        fillLight.position.set(5, -3, 5);
        this.scene.add(fillLight);

        // Time
        this.clock = new THREE.Clock();
    }

    setupPostProcessing() {
        // Bloom removed - using direct rendering for cleaner look
        this.composer = null;
    }

    createCrystalUniverse() {
        this.crystalGroup = new THREE.Group();
        this.scene.add(this.crystalGroup);

        // --- 1. The Glass Shell ---
        const geometry = new THREE.DodecahedronGeometry(2.5, 0);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 0.95,
            opacity: 1.0,
            metalness: 0.0,
            roughness: 0.05,
            ior: 1.45,
            thickness: 0.5, // Reduced for clarity
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            side: THREE.FrontSide
        });
        this.crystal = new THREE.Mesh(geometry, material);
        this.crystalGroup.add(this.crystal);

        // --- 2. Gold Edges ---
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffd700,
            opacity: 0.3,
            transparent: true
        });
        this.wireframe = new THREE.LineSegments(edges, lineMaterial);
        this.crystal.add(this.wireframe);

        // --- 3. Inner Universe Group ---
        this.innerGroup = new THREE.Group();
        this.crystalGroup.add(this.innerGroup);

        // Golden Material for Moon/Stars - matching reference
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xffcc44,
            roughness: 0.4,
            metalness: 0.6,
            emissive: 0xff9900,
            emissiveIntensity: 0.4
        });

        // A. The Sun (Shining Ball) - bright golden like reference
        // 1.5x smaller: 0.6 / 1.5 = 0.4
        const sunGeom = new THREE.SphereGeometry(0.4, 32, 32);
        const sunMat = new THREE.MeshStandardMaterial({
            color: 0xffdd66,
            emissive: 0xffaa00,
            emissiveIntensity: 1.2,
            roughness: 0.3,
            metalness: 0.2
        });
        this.sun = new THREE.Mesh(sunGeom, sunMat);
        // Position: right side (matching reference)
        this.sun.position.set(1.4, 0.2, 0.5);
        this.innerGroup.add(this.sun);

        // Internal Light - brighter for visibility
        const sunLight = new THREE.PointLight(0xffaa00, 8.0, 15);
        sunLight.position.copy(this.sun.position);
        this.innerGroup.add(sunLight);

        // B. The Moon (Extruded Crescent) - 2x smaller, smooth single object
        const moonShape = new THREE.Shape();
        const moonRadius = 0.25;
        const PI = Math.PI;

        // Create smooth crescent by drawing connected arcs
        moonShape.moveTo(moonRadius * Math.cos(-PI / 2), moonRadius * Math.sin(-PI / 2));
        // Outer arc (right half of circle)
        moonShape.absarc(0, 0, moonRadius, -PI / 2, PI / 2, false);
        // Inner arc creating the crescent cutout
        moonShape.absarc(0.08, 0, moonRadius * 0.85, PI / 2, -PI / 2, true);

        const extrudeSettings = {
            depth: 0.08,
            bevelEnabled: false // No bevel for cleaner single-piece look
        };
        const moonGeom = new THREE.ExtrudeGeometry(moonShape, extrudeSettings);
        moonGeom.center();

        this.moon = new THREE.Mesh(moonGeom, goldMat);
        // Position: left-middle (matching reference)
        this.moon.position.set(-1.1, -0.2, 0.3);
        this.moon.rotation.z = Math.PI / 8; // Subtle tilt
        this.innerGroup.add(this.moon);

        // Debug Box Removed as per 'cleanup' implication, can re-add if needed

        // C. 5-Pointed Stars - 18 total, 1.5x smaller (0.053), concentrated bottom-left
        const starShape = this.createStarShape(5, 0.053, 0.027); // 1.5x smaller
        const starGeom = new THREE.ExtrudeGeometry(starShape, {
            depth: 0.02,
            bevelEnabled: true,
            bevelThickness: 0.003,
            bevelSize: 0.003,
            bevelSegments: 1
        });

        // Generate 18 star positions in left/bottom-left area (matching reference)
        const starPositions = [];
        for (let i = 0; i < 18; i++) {
            // Left side and bottom-left area
            // x: -1.6 to -0.4, y: -1.6 to 0.4, z: -1.0 to 1.0
            starPositions.push(new THREE.Vector3(
                -0.4 - Math.random() * 1.2,  // -0.4 to -1.6 (left)
                -0.6 - Math.random() * 1.0,  // -0.6 to -1.6 (bottom bias)
                -1.0 + Math.random() * 2.0   // -1.0 to 1.0 (full depth)
            ));
        }

        starPositions.forEach((pos) => {
            const star = new THREE.Mesh(starGeom, goldMat);
            star.position.copy(pos);
            star.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            this.innerGroup.add(star);
        });
    }

    createStarShape(points, outerRadius, innerRadius) {
        const shape = new THREE.Shape();
        const step = Math.PI / points;

        shape.moveTo(0, outerRadius);
        for (let i = 0; i < 2 * points; i++) {
            const r = (i % 2 === 0) ? outerRadius : innerRadius;
            const a = i * step;
            shape.lineTo(r * Math.sin(a), r * Math.cos(a));
        }
        shape.closePath();
        return shape;
    }

    addBackgroundStars() {
        const particlesGeometry = new THREE.BufferGeometry();
        const count = 1000;
        const posArray = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 60;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const material = new THREE.PointsMaterial({
            size: 0.08,
            color: 0x88ccff,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        this.stars = new THREE.Points(particlesGeometry, material);
        this.scene.add(this.stars);
    }

    setupResize() {
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        if (this.composer) {
            this.composer.setSize(this.width, this.height);
        }
    }

    render() {
        requestAnimationFrame(this.render.bind(this));

        const elapsedTime = this.clock.getElapsedTime();

        if (this.crystalGroup) {
            this.crystalGroup.rotation.y = elapsedTime * 0.1;
            this.crystalGroup.rotation.z = Math.sin(elapsedTime * 0.1) * 0.05;
        }

        if (this.innerGroup) {
            this.innerGroup.rotation.y = elapsedTime * 0.05;
        }

        if (this.stars) {
            this.stars.rotation.y = -elapsedTime * 0.02;
        }

        // Direct rendering (no post-processing)
        this.renderer.render(this.scene, this.camera);
    }
}

new App();
