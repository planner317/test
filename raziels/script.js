import * as THREE from './modules/three/build/three.module.js';

import Stats from './modules/three/examples/jsm/libs/stats.module.js';

import { OrbitControls } from './modules/three/examples/jsm/controls/OrbitControls.js';
import { GUI } from './modules/three/examples/jsm/libs/dat.gui.module.js';
import { OBJLoader } from './modules/three/examples/jsm/loaders/OBJLoader.js';

let scene, camera, renderer, pointL, stats, raziel, controls, gui, param
init();
animate();
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111)

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(0, 0, 10)
    //camera.near = 10

    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    // управление камерой  
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    // Свет
    scene.add(new THREE.AmbientLight(0xFFffFF, 0.8))
    pointL = new THREE.PointLight(0xffFFff)
    pointL.position.y = 2
    scene.add(pointL);
    // текстура

    // helpers
    // scene.add(new THREE.AxesHelper())
    // scene.add(new THREE.GridHelper())
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
            raziel.position.y=-3
            scene.add(raziel);
            randomRaziel(5000,100)
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

    var loader = new OBJLoader( manager );
    loader.load('./raziel/raziel1hool.obj', function (obj) {
        raziel = obj;
    }, onProgress, onError);
    // доп 

    //GUI
    gui = new GUI()
    param = {
        dampingFactor: 0.005,
    }

    gui.add(param, `dampingFactor`, 0.001, 0.5, 0.001).onChange(updateParam)
    updateParam()


}


function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    stats.update();
    controls.update()
}

function updateParam() {
    controls.dampingFactor = param.dampingFactor
}
function randomRaziel(n, radius) {

    for (let i = 0; i < n; i++) { // выполняю n раз
        let clone = new THREE.Object3D()
        clone.copy(raziel)
        let x = (0 - radius) + Math.random() * radius * 2
        let y = (0 - radius) + Math.random() * radius * 2
        let z = (0 - radius) + Math.random() * radius * 2

        clone.position.set(x, y, z);
        clone.rotation.x = Math.random() * Math.PI
        clone.rotation.y = Math.random() * Math.PI
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