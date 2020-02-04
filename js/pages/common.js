function CommonScene(id, label) {
    // Add ID.
    this.id = id;
    // Add the label.
    this.label = label;
}

CommonScene.prototype.initScene = function () {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color('#e7e7e7');
    if (document.getElementById(this.id)) {
        var canvas = document.getElementById("card-coordinates");
        var camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.width, 0.1, 1000);
        var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.gammaFactor = 2.2;
        renderer.gammaOutput = true;
        var geometry = new THREE.BoxGeometry(10, 10, 10);
        var material = new THREE.MeshLambertMaterial({
            color: 'grey', side: THREE.FrontSide,
            shadowSide: THREE.FrontSide
        });
        var cube = new THREE.Mesh(geometry, material);
        cube.receiveShadow = true;
        cube.castShadow = true;
        cube.geometry.computeVertexNormals();
        scene.add(cube);

        // Spotlight shining from the side, casting a shadow
        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(100, 1000, 100);

        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 500;
        spotLight.shadow.camera.far = 4000;
        spotLight.shadow.camera.fov = 5;
        scene.add(spotLight);

        camera.position.z = 25;
        camera.position.y = -3;

        var animate = function () {
            requestAnimationFrame(animate);

            cube.rotation.x += 0.001;
            cube.rotation.y += 0.008;

            renderer.render(scene, camera);
        };

        animate();
    }
    else {
        throw new Error("no canvas wrapper found...");
    }

}

try {
    var commonScene = new CommonScene("card-coordinates", "Test card");
    commonScene.initScene();
}
catch (e) {
    console.log(e);
}

var query = `
query {
    nodeQuery(limit: 10, offset: 0, filter: {conditions: [{operator: EQUAL, field: "type", value: ["cards_set"]}]}) {
      entities {
        entityLabel,
        fieldCards {
          entity {
            fieldCardText {
              value,
            }
            fieldCardImage {
              url
            }
          }
        }
      }
    }
  }`;

fetch('http://localhost:8084/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    query
  })
})
  .then(r => r.json())
  .then(data => console.log('data returned:', data));