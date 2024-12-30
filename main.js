import * as THREE from "three";
import { json } from "./data.js";
import { CurvePlane } from "./CurvePlane.js";

// Setup de base
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Fonction pour charger une texture
const textureLoader = new THREE.TextureLoader();

// Liste des meshes pour Raycasting
const interactiveMeshes = [];

// Variables pour gérer le défilement
let scrollY = 0;
let targetScrollY = 0;
const scrollSpeed = 0.1;

// Wireframe fixe au centre
let wireframeModel;

// Fonction pour créer un anneau avec des plans incurvés
function createRing(ringData, yOffset) {
    const group = new THREE.Group();
    group.position.y = yOffset; // Décalage sur l'axe Y
    const radius = ringData.medias[0].r;
    const angleStep = (Math.PI * 2) / ringData.medias.length;

    ringData.medias.forEach((media, index) => {
        const angle = index * angleStep;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);

        // Charger la texture de l'image
        const texture = textureLoader.load(`./medias/${media.n}`);

        // Calculer les dimensions du plan
        const aspectRatio = media.w / media.h;
        const height = 4;
        const width = height * aspectRatio;

        // Créer le plan incurvé
        const curvePlane = new CurvePlane(width, height, radius, texture);
        const planeMesh = curvePlane.getMesh();
        planeMesh.position.set(x, 0, z);
        planeMesh.lookAt(0, 0, 0);

        // Ajouter aux meshes interactifs
        interactiveMeshes.push(curvePlane);

        group.add(planeMesh);
    });

    scene.add(group);
    return group;
}

// Créer un modèle Wireframe au centre de la scène
function createWireframeModel() {
    const geometry = new THREE.SphereGeometry(2, 15, 15);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        opacity: 1,
        transparent: true,
    });

    wireframeModel = new THREE.Mesh(geometry, wireframeMaterial);
    wireframeModel.position.set(0, 0, 0);
    scene.add(wireframeModel);
}

// Charger les anneaux
const rings = [];
const ringSpacing = 10; // Espacement vertical entre les anneaux

json.rings.forEach((ringData, index) => {
    const yOffset = -index * ringSpacing; // Positionner chaque anneau en fonction de l'index
    const ringGroup = createRing(ringData, yOffset);
    rings.push(ringGroup);
});

// Créer le modèle wireframe
createWireframeModel();

// Gestion du scroll
function onScroll(event) {
    targetScrollY += event.deltaY * 0.1; // Accumuler le scroll cible
}

// Animation
function animate() {
    requestAnimationFrame(animate);

    // Lissage du défilement
    scrollY += (targetScrollY - scrollY) * scrollSpeed;

    // Déplacer les anneaux en fonction du scroll
    rings.forEach((ring, index) => {
        ring.position.y = -index * ringSpacing + scrollY; // Mise à jour de la position Y
        ring.rotation.y += 0.01; // Les anneaux continuent de tourner
    });

    // Faire tourner le modèle wireframe en fonction du scroll
    wireframeModel.rotation.y = scrollY * 0.1;

    renderer.render(scene, camera);
}
animate();

// Gestion du hover
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveMeshes.map((obj) => obj.mesh));

    interactiveMeshes.forEach((mesh) => {
        mesh.setHoverEffect(0.0); // Pas d'effet par défaut
    });

    intersects.forEach((intersect) => {
        const curvePlane = interactiveMeshes.find((obj) => obj.mesh === intersect.object);
        if (curvePlane) {
            curvePlane.setHoverEffect(1.0); // Activer l'effet de survol
        }
    });
}

// Événements
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

window.addEventListener("mousemove", onMouseMove);
window.addEventListener("wheel", onScroll);