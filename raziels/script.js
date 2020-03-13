import * as THREE from './modules/three/build/three.module.js';

import Stats from './modules/three/examples/jsm/libs/stats.module.js';

import { OrbitControls } from './modules/three/examples/jsm/controls/OrbitControls.js';
import { GUI } from './modules/three/examples/jsm/libs/dat.gui.module.js';
import { OBJLoader } from './modules/three/examples/jsm/loaders/OBJLoader.js';

let scene, camera, renderer, pointL, stats, raziel, controls, gui, param, x, y, z, flag = true, reload = true
let music = document.querySelector("audio")
let soulNois = document.getElementById("soulNois")

scene = new THREE.Scene();
scene.background = new THREE.Color(0x0)

camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
camera.position.set(0, 0, 10)

renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// управление камерой  
controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// Свет
var AmbientLight = new THREE.AmbientLight(0xFFffFF, 0.8)
scene.add(AmbientLight)

pointL = new THREE.PointLight(0x99FF99)
pointL.position.set(0, 0, 15)

// helper
let helper = new THREE.AxesHelper(3)
helper.add(pointL)
helper.position.y = -5
scene.add(helper);
// статус fps
stats = new Stats();
document.body.appendChild(stats.dom);

// manager
function loadModel() {
    raziel.traverse(function (child) {
        if (child.isMesh) {
            child.material.map = texture;
            child.material.side = THREE.DoubleSide;
            child.material.transparent = true
        }
        raziel.scale.set(0.03, 0.03, 0.03)
        raziel.position.y = -3
        scene.add(raziel);
    });
}

var manager = new THREE.LoadingManager(loadModel);
manager.onProgress = function (item, loaded, total) {
    console.log(item, loaded, total);
};

// texture
var textureLoader = new THREE.TextureLoader(manager);
var texture = textureLoader.load('./raziel/raziel.png');

// model
function onProgress(xhr) {
    if (xhr.lengthComputable) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log('model ' + Math.round(percentComplete, 2) + '% downloaded');
    }
}

function onError() { console.log("ошибка"); }

var loader = new OBJLoader(manager);
loader.load('./raziel/raziel.obj', function (obj) {
    raziel = obj;
}, onProgress, onError);
// спрайт
var spriteMap = new THREE.TextureLoader().load('./raziel/soul.png');
var spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff });
var sprite = new THREE.Sprite(spriteMaterial);
sprite.scale.set(5, 5, 1)
pointL.add(sprite);

//GUI
gui = new GUI()
param = {
    dampingCamera: 0.005,
    radius: 40,
    raziels: 1000,
    "ДОБАВИТЬ RAZIELS": randomRaziel,
    music: 0.1,
    AmbientLight: 1,
    SoulLight: 4,
    distanceLight: 120,
    soulMoved: false,
}
gui.add(param, `radius`, 10, 100)
gui.add(param, `raziels`, 1, 10000)
gui.add(param, `ДОБАВИТЬ RAZIELS`)
gui.add(param, `music`, 0, 1).onChange(updateParamControl)
gui.add(param, `dampingCamera`, 0.001, 0.5, 0.001).onChange(updateParamControl)
gui.add(param, `AmbientLight`, 0.001, 2, 0.001).onChange(updateParamControl)
gui.add(param, `SoulLight`, 0.001, 20, 0.001).onChange(updateParamControl)
gui.add(param, `distanceLight`, 0.001, 200, 0.001).onChange(updateParamControl)
gui.add(param, `soulMoved`)

updateParamControl()

/////////////////////////////// audio //////

var listener = new THREE.AudioListener();
camera.add(listener);

var audioLoader = new THREE.AudioLoader();

var sound1 = new THREE.PositionalAudio(listener);
audioLoader.load('./raziel/03954.mp3', function (buffer) {
    
    sound1.setBuffer(buffer);
    sound1.setRefDistance(5);
    sound1.loop=true
    sound1.volume=10
});
window.onclick = () => {
    music.play()
    sound1.play()
    
}
pointL.add(sound1);

let y1=1
animate();
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update();
    controls.update()

    pointL.position.y=Math.sin(y1)*2
    y1+=0.05
    if (param.soulMoved) soulRun()
    else {
        helper.rotateY(0.01)
    }
}

animateSoul()
function animateSoul() {
    const bigSoul = []
    const miniSoul = []
    let r
    for (let i = 0; i < 50; i++) {
        let mat = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff });
        bigSoul[i] = new THREE.Sprite(mat);
        bigSoul[i].scale.set(5, 5, 1)
        scene.add(bigSoul[i])
    }
    for (let i = 0; i < 100; i++) {
        let mat = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff });
        miniSoul[i] = new THREE.Sprite(mat);
        r = Math.random() / 1.5 + 0.33
        miniSoul[i].scale.set(r, r, 1)
        scene.add(miniSoul[i])
    }
    let mini = 0, big = 0, n = 0
    let v = new THREE.Vector3
    setInterval(() => {
        pointL.getWorldPosition(v)

        bigSoul[big].position.set(v.x, v.y, v.z)
        bigSoul[big].material.opacity = 1
        big++;
        if (big == bigSoul.length) big = 0
        bigSoul.forEach((o) => o.material.opacity -= 1 / bigSoul.length)

        if (++n % 2) {
            miniSoul[mini].position.set(v.x + Math.random() * 4 - 2, v.y + Math.random() * 4 - 2, v.z + Math.random() * 2 - 1)
            miniSoul[mini].material.opacity = 5
            mini++;
            if (mini == miniSoul.length) mini = 0
            miniSoul.forEach((o) => o.material.opacity -= 1 / miniSoul.length * 5)
        }
    }, 10)
}

function soulRun() {
    if (!reload) {
        y = Math.random() * 100 - 50
        z = Math.random() * 100 - 50
        x = -200
        pointL.position.set(x, y, z)
    }
    flag = reload = true
    pointL.translateX(2)
    if (pointL.position.x > 200) reload = false;
}

function updateParamControl() {
    controls.dampingFactor = param.dampingCamera
    AmbientLight.intensity = param.AmbientLight
    pointL.intensity = param.SoulLight
    pointL.distance = param.distanceLight
    music.volume = param.music
}

function randomRaziel() {

    for (let i = 0; i < param.raziels; i++) { // выполняю n раз
        let clone = new THREE.Object3D()
        clone.copy(raziel)
        let x = (0 - param.radius) + Math.random() * param.radius * 2
        let y = (0 - param.radius) + Math.random() * param.radius * 2
        let z = (0 - param.radius) + Math.random() * param.radius * 2

        clone.position.set(x, y, z);
        clone.rotation.x = Math.random() * Math.PI
        clone.rotation.y = Math.random() * Math.PI
        clone.rotation.z = Math.random() * Math.PI
        scene.add(clone)
    }
}

renderer.domElement

// самоподстраивается при изменении экрана
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}