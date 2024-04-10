import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { PositionalAudio } from "three";

export class Sculpture {
  constructor(dimensions, position, scale, quaternion) {
    this.dimensions = dimensions;
    this.position = position;
    this.scale = scale;
    this.quaternion = quaternion;
    this.components = new THREE.Group();

    for (let k = 0; k < dimensions[2]; k++) {
      for (let j = 0; j < dimensions[1]; j++) {
        for (let i = 0; i < dimensions[0]; i++) {
          // Calculate element's position
          const position = new THREE.Vector3(
            i - dimensions[0] * 0.5 + 0.5,
            dimensions[1] - j,
            k - dimensions[2] * 0.5 + 0.5
          );

          // Set random element's type
          let type = Math.floor(Math.random() * 3);

          // Create random phong material
          let material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(0.0, 0.0, Math.random()),
          });

          // Define geometry and mesh
          let geometry, mesh;

          // Set geometries and meshes
          switch (type) {
            case 0:
              // Add dot object to components' group
              geometry = new THREE.SphereGeometry(1.0, 16.0, 8.0);
              geometry.rotateY(Math.random() * Math.PI * 2);
              geometry.scale(0.0625, 0.0625, 0.0625);
              mesh = new THREE.Mesh(geometry, material);
              mesh.position.set(position.x, position.y, position.z);
              this.components.add(mesh);
              break;
            case 1:
              // Add cross object to components' group
              geometry = BufferGeometryUtils.mergeGeometries([
                new THREE.CylinderGeometry(0.1, 0.1, 2.0).rotateZ(
                  Math.PI * 0.25
                ),
                new THREE.CylinderGeometry(0.1, 0.1, 2.0).rotateZ(
                  Math.PI * -0.25
                ),
              ]);
              geometry.rotateY(Math.random() * Math.PI * 2);
              geometry.scale(0.125, 0.125, 0.125);
              mesh = new THREE.Mesh(geometry, material);
              mesh.position.set(position.x, position.y, position.z);
              this.components.add(mesh);
              break;
            case 2:
              // Add rings to group and add it to components' group
              const ringGroup = new THREE.Group();
              const baseScale = Math.random() * 2.0 + 0.1;
              const ringInstances = 5;
              for (let ring = 1; ring <= ringInstances; ring++) {
                geometry = new THREE.TorusGeometry(1, 0.015625, 16, 32);
                mesh = new THREE.Mesh(geometry, material);
                mesh.uScale = ring / ringInstances;
                mesh.scale.set(mesh.uScale, mesh.uScale, mesh.uScale);
                ringGroup.add(mesh);
              }
              ringGroup.position.set(position.x, position.y, position.z);
              ringGroup.scale.set(baseScale, baseScale, baseScale);
              ringGroup.rotateX(Math.random() * Math.PI * 2);
              ringGroup.rotateY(Math.random() * Math.PI * 2);
              ringGroup.rotateZ(Math.random() * Math.PI * 2);
              this.components.add(ringGroup);
              break;
          }
        }
      }
    }
    this.components.position.copy(position);
    this.components.scale.copy(scale);
    this.components.quaternion.copy(quaternion);

    console.log(this.components);
  }

  addToScene(scene) {
    scene.add(this.components);
  }
  update() {
    this.components.children.forEach((component) => {
      if (component.type === "Mesh") {
        component.rotation.y += 0.05;
      } else if (component.type === "Group") {
        const increment = 0.005;
        component.children.forEach((element) => {
          if (element.uScale > 1.0) {
            element.uScale = 0.01;
          }
          element.scale.set(element.uScale, element.uScale, element.uScale);
          element.uScale += increment;
        });
      }
    });
  }
}
