const container = document.getElementById('chart');

let scene, camera, renderer, controls;
let examRoomCount = 0;
let providerCount = 0;
let mainLight = null;

const MAX_CUBES = 1000; 
const cubes = { exam: [], provider: [] };

const materials = {
    exam: new THREE.MeshLambertMaterial({ color: 0xae0001, transparent: false, opacity: 1 }), 
    provider: new THREE.MeshLambertMaterial({ color: 0xeeba30, transparent: false, opacity: 1 }) 
};

function setLighting(type) {
    if (mainLight) {
        scene.remove(mainLight);
        mainLight = null;
    }

    switch (type) {
        case 'directional':
            mainLight = addDirectionalLight(scene);
            break;
        case 'point':
            mainLight = addPointLight(scene);
            break;
        case 'spotlight':
            mainLight = addSpotLight(scene);
            break;
        default:
            mainLight = addDirectionalLight(scene); // fallback to directional or do nothing
            break;
    }
}

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 30);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Create a transparent floor
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x808080, opacity: 0.5, transparent: true });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Create ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    setLighting('directional'); // default lighting

    // Create initial cubes
    createCubes('exam', MAX_CUBES);
    createCubes('provider', MAX_CUBES);

    animate();
}

// Function to create a label texture
function createLabelTexture(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontSize = 24;
    canvas.width = 256;
    canvas.height = 64;

    context.fillStyle = 'rgba(255, 255, 255, 0)'; // Transparent background
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = `${fontSize}px Arial`;
    context.fillStyle = 'black'; // text color
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineWidth = 2; // Text border thickness
    context.strokeStyle = 'black'; // Text border color
    context.strokeText(text, canvas.width / 2, canvas.height / 2); // Apply border
    context.fillText(text, canvas.width / 2, canvas.height / 2); // Apply color

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}


// Function to create labels on top of cubes
function createLabel(text, position) {
    const labelTexture = createLabelTexture(text);
    const spriteMaterial = new THREE.SpriteMaterial({ map: labelTexture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(5, 1.25, 1); // Adjust the label size
    sprite.position.copy(position);
    sprite.position.y += 2; // Adjust the height of the label above the cube.
    return sprite;
}

function createCubes(type, count, color) {
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);

    // Determine the material to be used
    const material = materials[type] || new THREE.MeshLambertMaterial({ color: color });

    const edges = new THREE.EdgesGeometry(boxGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Color of the lines

    for (let i = 0; i < count; i++) {
        const box = new THREE.Mesh(boxGeometry, material);
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        box.add(wireframe);
        box.castShadow = true; // Allowing the cubes to cast shadows
        box.visible = false;
        cubes[type].push(box);
        scene.add(box);

        // Add the label on top of the cube
        const labelText = type === 'exam' ? 'ER' : 'P';
        const label = createLabel(labelText, box.position);
        box.add(label);
    }
}


function updateCubes(type, count) {
    const spacing = 3;
    const startX = type === 'exam' ? -15 : 15;
    const startZ = 0;

    for (let i = 0; i < MAX_CUBES; i++) {
        if (i < count) {
            const x = startX + (i % 5) * spacing;
            const z = startZ + Math.floor(i / 5) * spacing;
            cubes[type][i].position.set(x, 1, z);
            cubes[type][i].visible = true;
        } else {
            cubes[type][i].visible = false;
        }
    }
}

function setShading(style) {
    // For each type of cube
    ['exam', 'provider'].forEach(type => {
        cubes[type].forEach(box => {
            box.material = getMaterialForStyle(style, box.material.color.getHex());
        });
    });
}

function getMaterialForStyle(style, color) {
    switch (style) {
        case 'wireframe':
            return new THREE.MeshBasicMaterial({ color, wireframe: true });
        case 'lambert':
            return new THREE.MeshLambertMaterial({ color });
        case 'phong':
            return new THREE.MeshPhongMaterial({ color, shininess: 100 });
        case 'standard':
            return new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.2 });
        case 'ghosted':
            return new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.3 });
        default:
            return new THREE.MeshLambertMaterial({ color });
    }
}

// Helper functions for lighting settings
function addDirectionalLight(scene) {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    light.castShadow = true;
    scene.add(light);
    return light;
}
function addPointLight(scene) {
    const light = new THREE.PointLight(0xffffff, 1, 50);
    light.position.set(10, 20, 10);
    light.castShadow = true;
    scene.add(light);
    return light;
}
function addSpotLight(scene) {
    const light = new THREE.SpotLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    light.castShadow = true;
    scene.add(light);
    return light;
} // add more light types (eg rect area light, hemisphere light)


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

document.addEventListener('examRoomsUpdate', (event) => {
    examRoomCount = event.detail;
    updateCubes('exam', examRoomCount);
});

document.addEventListener('providersUpdate', (event) => {
    providerCount = event.detail;
    updateCubes('provider', providerCount);
});

document.getElementById('lighting').addEventListener('change', (event) => {
    const selectedLighting = event.target.value;
    setLighting(selectedLighting);
});

document.getElementById('shadingStyle').addEventListener('change', (event) => {
    setShading(event.target.value);
});
  
init();