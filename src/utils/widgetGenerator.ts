import { SceneConfig } from '../types/scene';
import { PALETTES } from '../constants/palettes';

export function generateWidgetSnippet(config: SceneConfig): string {
  const paletteObj = PALETTES[config.palette] || PALETTES.mondrian;
  const paletteJson = JSON.stringify(paletteObj.colors);
  const configJson = JSON.stringify(config);

  const innerHTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Opus 3D Block Scene Widget</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { overflow: hidden; background: #1a1a1a; width: 100vw; height: 100vh; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
  <script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.170.0/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.170.0/examples/jsm/"
      }
    }
  </script>
</head>
<body>
  <script type="module">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    const CONFIG = ${configJson};
    const PALETTE_COLORS = ${paletteJson};

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1a1a');

    const perspCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    perspCamera.position.set(0, 20, 0);
    perspCamera.lookAt(0, 0, 0);

    const ORTHO_SIZE = 15;
    const aspect = window.innerWidth / window.innerHeight;
    const orthoCamera = new THREE.OrthographicCamera(-ORTHO_SIZE * aspect, ORTHO_SIZE * aspect, ORTHO_SIZE, -ORTHO_SIZE, 0.1, 1000);
    orthoCamera.position.set(0, 20, 0);
    orthoCamera.lookAt(0, 0, 0);

    let activeCamera = CONFIG.cameraMode === 'orthographic' ? orthoCamera : perspCamera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    let controls = new OrbitControls(activeCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.mouseButtons = { LEFT: null, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.ROTATE };

    let gridGroup = null;

    function generateBlocks() {
      if (gridGroup) {
        gridGroup.traverse(child => {
          if (child.isMesh) {
            child.geometry.dispose();
            child.material.dispose();
          }
        });
        scene.remove(gridGroup);
      }

      gridGroup = new THREE.Group();
      scene.add(gridGroup);

      const totalWidth = CONFIG.cols * (1 + CONFIG.gap) - CONFIG.gap;
      const totalDepth = CONFIG.rows * (1 + CONFIG.gap) - CONFIG.gap;
      const offsetX = -totalWidth / 2 + 0.5;
      const offsetZ = -totalDepth / 2 + 0.5;

      for (let r = 0; r < CONFIG.rows; r++) {
        for (let c = 0; c < CONFIG.cols; c++) {
          const height = Math.random() * (CONFIG.maxHeight - 0.2) + 0.2;
          const width = Math.random() * (CONFIG.maxWidth - 0.5) + 0.5;
          const depth = Math.random() * (CONFIG.maxWidth - 0.5) + 0.5;

          const geometry = new THREE.BoxGeometry(width, height, depth);
          const colorHex = PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)];
          const material = new THREE.MeshBasicMaterial({ color: colorHex });
          const mesh = new THREE.Mesh(geometry, material);

          const posX = offsetX + c * (1 + CONFIG.gap);
          const posZ = offsetZ + r * (1 + CONFIG.gap);
          const posY = height / 2;
          mesh.position.set(posX, posY, posZ);

          mesh.userData = {
            spinning: false,
            spinAxis: Math.random() < 0.5 ? 'x' : 'z',
            spinSpeed: CONFIG.speed
          };

          gridGroup.add(mesh);
        }
      }
    }

    generateBlocks();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    window.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, activeCamera);
      const intersects = raycaster.intersectObjects(gridGroup ? gridGroup.children : []);
      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        clickedMesh.userData.spinning = !clickedMesh.userData.spinning;
      }
    });

    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      perspCamera.aspect = width / height;
      perspCamera.updateProjectionMatrix();

      const newAspect = width / height;
      orthoCamera.left = -ORTHO_SIZE * newAspect;
      orthoCamera.right = ORTHO_SIZE * newAspect;
      orthoCamera.top = ORTHO_SIZE;
      orthoCamera.bottom = -ORTHO_SIZE;
      orthoCamera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update();

      const MAX_PAN = 15;
      controls.target.x = THREE.MathUtils.clamp(controls.target.x, -MAX_PAN, MAX_PAN);
      controls.target.z = THREE.MathUtils.clamp(controls.target.z, -MAX_PAN, MAX_PAN);

      if (gridGroup) {
        gridGroup.children.forEach(mesh => {
          if (mesh.userData.spinning) {
            if (mesh.userData.spinAxis === 'x') {
              mesh.rotation.x += mesh.userData.spinSpeed;
            } else {
              mesh.rotation.z += mesh.userData.spinSpeed;
            }
          }
        });
      }

      renderer.render(scene, activeCamera);
    }

    animate();
  </script>
</body>
</html>`;

  // Return formatted iframe widget embed string
  const encodedSrcDoc = innerHTML
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  return `<iframe 
  srcdoc="${encodedSrcDoc}" 
  width="100%" 
  height="500px" 
  style="border: none; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" 
  allow="fullscreen"
></iframe>`;
}
