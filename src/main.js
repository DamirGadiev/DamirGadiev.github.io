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
        this.renderer.autoClear = false;
        this.container.appendChild(this.renderer.domElement);

        console.log("App Version: 1.1.0 - Vertex Wave Shader");

        // Interaction Setup
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.ripple = {
            center: new THREE.Vector2(0, 0),
            time: 0,
            active: false
        };

        // Initial Objects
        this.addObjects();
        this.addLights();
        this.initSplat();

        // Events
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('mousedown', this.onInteraction.bind(this));
        window.addEventListener('touchstart', this.onInteraction.bind(this), { passive: false });

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
            'useBuiltInControls': false, // Removed as requested
            'splatAlphaRemovalThreshold': 5, // Removes highly transparent splats for better performance
            'freeIntermediateSplatData': true, // Frees memory after loading
        });

        // Load the splat file based on device type
        try {
            // Check for mobile (window width < 768px or basic User Agent check)
            const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
            const splatPath = isMobile ? '/models/splat.ksplat' : '/models/splat-hq.ksplat';

            console.log(`Loading ${isMobile ? 'Mobile' : 'Desktop'} splat: ${splatPath}`);

            // Calculate quaternion for 180deg Y and 180deg Z rotation
            const q = new THREE.Quaternion();
            q.setFromEuler(new THREE.Euler(0, Math.PI, Math.PI));

            await this.splatViewer.addSplatScene(splatPath, {
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
        // Background Stars - Reduced count to 2500 and metallic golden color
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 2500; i++) {
            vertices.push(THREE.MathUtils.randFloatSpread(100));
            vertices.push(THREE.MathUtils.randFloatSpread(100));
            vertices.push(THREE.MathUtils.randFloatSpread(100));
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({
            color: 0xffcc00, // Metallic Gold
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            depthWrite: false, // CRITICAL: Stars should not write to depth buffer
            depthTest: true
        });
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

    onInteraction(event) {
        // Prevent default behavior to avoid scrolling on mobile
        if (event.type === 'touchstart') {
            // event.preventDefault(); // Don't prevent default yet, might break SubStack link
        }

        if (event.touches) {
            this.mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
        } else {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        // Trigger the "Water Surface" Ripple
        this.ripple.center.set(this.mouse.x, this.mouse.y);
        this.ripple.time = 0;
        this.ripple.active = true;
    }

    // We removed the separate wave mesh creation in favor of the global "water surface" effect

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        if (this.stars) {
            this.stars.rotation.y = elapsed * 0.005;
        }

        // Progress Ripple Effect
        if (this.ripple.active) {
            this.ripple.time += delta * 0.75;
            if (this.ripple.time > 2.0) {
                this.ripple.active = false;
            }
        }

        // Manual Clear
        this.renderer.clear();

        // 1. Render Background Stars & Scene
        this.renderer.render(this.scene, this.camera);

        // 2. Render Splat with Wave Displacement
        if (this.splatViewer) {
            const splatMesh = this.splatViewer.getSplatMesh();

            // Inject wave shader directly into the ShaderMaterial
            // (onBeforeCompile does NOT work with THREE.ShaderMaterial — only with built-in materials)
            if (splatMesh && splatMesh.material && !splatMesh.material.userData.waveInjected) {
                this.injectWaveShader(splatMesh);
            }

            // Update wave uniforms every frame
            if (splatMesh && splatMesh.material && splatMesh.material.userData.waveInjected) {
                const uniforms = splatMesh.material.uniforms;
                if (this.ripple.active) {
                    uniforms.uWaveTime.value = this.ripple.time;
                    uniforms.uWaveCenter.value.set(this.ripple.center.x, this.ripple.center.y);
                    uniforms.uWaveIntensity.value = (1.0 - this.ripple.time / 2.0) * 1.0;
                } else {
                    uniforms.uWaveIntensity.value = 0.0;
                }
            }

            this.splatViewer.update();
            this.splatViewer.render();
        }
    }

    /**
     * Directly patch the ShaderMaterial's vertexShader string and uniforms
     * to add wave displacement to each splat's world-space center.
     */
    injectWaveShader(splatMesh) {
        const mat = splatMesh.material;
        const vs = mat.vertexShader;

        // Add wave uniforms to the material
        mat.uniforms.uWaveTime = { value: 0.0 };
        mat.uniforms.uWaveCenter = { value: new THREE.Vector2(0, 0) };
        mat.uniforms.uWaveIntensity = { value: 0.0 };

        // Uniform declarations to prepend to the shader
        const waveUniforms = `
uniform float uWaveTime;
uniform vec2 uWaveCenter;
uniform float uWaveIntensity;
`;

        // The anchor: we displace splatCenter BEFORE it is transformed to viewCenter.
        // The library shader contains this exact line:
        //   vec4 viewCenter = transformModelViewMatrix * vec4(splatCenter, 1.0);
        // We inject displacement of splatCenter just before it.
        const anchor = 'vec4 viewCenter = transformModelViewMatrix * vec4(splatCenter, 1.0);';
        const waveLogic = `
            // --- Wave Displacement ---
            if (uWaveIntensity > 0.0) {
                // Distance from click point (NDC-ish coords mapped to world XY)
                float wDist = distance(splatCenter.xy, uWaveCenter * 10.0);
                // Expanding ring: wave front moves outward with time
                float waveFront = uWaveTime * 7.5;
                float ringDist = abs(wDist - waveFront);
                // Smooth ring shape with falloff
                float ring = exp(-ringDist * ringDist * 0.5);
                // Oscillation within the ring
                float oscillation = sin(wDist * 2.0 - uWaveTime * 6.0);
                // Combine: displacement along Z (perpendicular to surface)
                float displacement = oscillation * ring * uWaveIntensity;
                splatCenter.z += displacement;
                // Subtle XY jitter for organic feel  
                splatCenter.x += displacement * 0.3 * cos(wDist * 12.0);
                splatCenter.y += displacement * 0.3 * sin(wDist * 12.0);
            }
            // --- End Wave ---
            vec4 viewCenter = transformModelViewMatrix * vec4(splatCenter, 1.0);`;

        if (vs.includes(anchor)) {
            mat.vertexShader = waveUniforms + vs.replace(anchor, waveLogic);
            mat.needsUpdate = true;
            mat.userData.waveInjected = true;
            console.log('✅ Wave shader injected successfully!');
        } else {
            console.warn('⚠️ Could not find anchor in vertex shader. Wave effect disabled.');
            console.log('Shader snippet (first 500 chars):', vs.substring(0, 500));
            mat.userData.waveInjected = true; // Prevent retrying every frame
        }
    }
}

new App();
