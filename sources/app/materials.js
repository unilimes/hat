import Instruction from './instruction.js';
import { Loader } from './loader.js';

class Materials {

  constructor( renderer ) {
    this.renderer = renderer;
    this.associations = {};

    this.loader = new Loader();

  }

  setAssociations( associations ) {
    this.associations = associations;
  }

  setMaterial( intersected, config, done ) {

    this.intersected = intersected.object;
    var type = config.type;
    var params = config.params;

    if (!this.intersected) {
      return false;
    }

    let anisotropy = this.renderer.app.gl.getMaxAnisotropy();
    //let repeat = this.intersected.parent.params.repeat || 1;
    let repeat = 1;

    async.series({
      base: (next) => {
        if (params.map && params.map.base) {
          this.loader.loadTexture( params.map.base, (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeat, repeat);
            texture.format = THREE.RGBAFormat;
            texture.anisotropy = anisotropy;
            texture.needsUpdate = true;

            next(null, texture);
          });
        } else {
          next(null, null);
        }
      },
      bump: (next) => {
        if (params.map && params.map.bump) {
          this.loader.loadTexture(params.map.bump, (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeat, repeat);
            texture.format = THREE.RGBAFormat;
            texture.anisotropy = anisotropy;
            texture.needsUpdate = true;

            next(null, texture);
          });
        } else {
          next(null, null);
        }
      },
      normal: (next) => {
        if (params.map && params.map.normal) {
          this.loader.loadTexture(params.map.normal, (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeat, repeat);
            texture.format = THREE.RGBAFormat;
            texture.anisotropy = anisotropy;
            texture.needsUpdate = true;

            next(null, texture);
          });
        } else {
          next(null, null);
        }
      },
      ambient: (next) => {
        if (params.map && params.map.ambient) {
          this.loader.loadTexture(params.map.ambient, (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeat, repeat);
            texture.format = THREE.RGBAFormat;
            texture.anisotropy = anisotropy;
            texture.needsUpdate = true;

            next(null, texture);
          });
        } else {
          next(null, null);
        }
      },
      specular: (next) => {
        if (params.map && params.map.specular) {
          this.loader.loadTexture(params.map.specular, (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeat, repeat);
            texture.format = THREE.RGBAFormat;
            texture.anisotropy = anisotropy;
            texture.needsUpdate = true;

            next(null, texture);
          });
        } else {
          next(null, null);
        }
      },
      displacement: (next) => {
        if (params.map && params.map.displacement) {
          this.loader.loadTexture(params.map.displacement, (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeat, repeat);
            texture.format = THREE.RGBAFormat;
            texture.anisotropy = anisotropy;
            texture.needsUpdate = true;

            next(null, texture);
          });
        } else {
          next(null, null);
        }
      }
    }, (err, map) => {

      if(!this.intersected.current){
        this.intersected.current = {};
      }

      if(!this.intersected.userData){
        this.intersected.userData = {};
      }

      this.intersected.current.type = type;
      this.intersected.current.params = params;

      this.intersected.userData.type = this.intersected.current.type;
      this.intersected.userData.params = this.intersected.current.params;

      console.log( this.intersected );

      switch (type) {
        case "texture":
          this.intersected.material = new THREE.MeshPhongMaterial({
              name: this.intersected.material.name,
              color: new THREE.Color(params.color),
              shininess: params.shininess,
              map: map.base,
              bumpMap: map.bump,
              bumpScale: 0.25,
              normalMap: map.normal,
              normalScale: new THREE.Vector2(1, -1).multiplyScalar(3),
              displacementMap: map.displacement,
              displacementScale: 0.1,
              displacementBias: 0.01,
              specularMap: map.specular,
              aoMap: map.ambient,
              aoMapIntensity: 0.25,
              side: THREE.DoubleSide
            });
          break;
        case "matcap":
          let uniforms = {
            repeat: {
              value: new THREE.Vector2(1, 1)
            },
            time: {
              value: 0.0
            },
            bump: {
              value: 0.0
            },
            noise: {
              value: 0.0
            },
            color: {
              value: new THREE.Color(0xffffff)
            },
            tMatCap: {
              value: map.base
            },
            displacementMap: {
              value: map.displacement
            },
            displacementScale: {
              value: 0.0
            },
            displacementBias: {
              value: 0.0
            },
            tNormal: {
              value: map.normal
            },
            useScreen: {
              value: 0.0
            },
            useRim: {
              value: 0.0
            },
            rimPower: {
              value: 0.0
            },
            normalScale: {
              value: 0.3
            },
            normalRepeat: {
              value: 1.0
            }
          };

          this.loader.loadShader("shaders/matcap", (vertex, fragment) => {
            this.intersected.material = new THREE.ShaderMaterial({
              uniforms: uniforms,
              vertexShader: vertex,
              fragmentShader: fragment,
              side: THREE.DoubleSide
            });

            this.intersected.material.extensions.derivatives = true;
          });

          break;
        case "color":
          this.intersected.material = new THREE.MeshPhongMaterial({
            name: this.intersected.material.name,
            color: new THREE.Color(params.color),
            shininess: params.shininess,
            side: THREE.DoubleSide
          });
          break;
      }

      if(!this.intersected.original){
        this.intersected.original = {};
      }

      this.intersected.original.material = this.intersected.material.clone();

      if (typeof done === "function") {
        done(this.intersected);
      }
    });
  }

  setModel(params, done) {

    this.podium.remove( this.model );

    this.loader.loadModel(params.model, params, (object, materials) => {

      this.model = object;
      this.model.params = params;

      for (let key in this.associations) {
        let association = this.associations[key];

        for (let i = 0; i < association.materials.length; i++) {
          let name = association.materials[i];
          let mesh = this.model.getObjectByName(name);

          if (mesh) {
            mesh.name = key;
            mesh.association = association;
          }
        }
      }

      this.podium.add(this.model);

      async.eachOfSeries(params.materials, (material, name, next) => {
        this.intersected = object.getObjectByName(name);
        this.setMaterial(material.type, material.params, () => {
          next();
        });
      }, () => {
        this.intersected = null;

        if (typeof done === "function") {
          done(object, materials);
        }
      });
    });
  }

  setStyle(params, done) {
    let clone = this.model.clone();

    this.setModel(params, (object, materials) => {
      clone.traverse((mesh) => {
        if (mesh instanceof THREE.Mesh) {
          let child = object.getObjectByName(mesh.name);

          if (child) {
            child.current.type = mesh.userData.type;
            child.current.params = mesh.userData.params;

            child.userData.type = child.current.type;
            child.userData.params = child.current.params;

            child.material = mesh.material;
            child.original.material = child.material.clone();
          }
        }
      });

      if (typeof done === "function") {
        done(object, materials);
      }
    });
  }

  setExtra(params, done) {
    this.setStyle(params, done);
  }

  setSetting(params, done) {
    this.podium.animation = params.animation;

    this.podium.material.visible = params.podium;
    this.shadow.visible = params.podium;

    if (typeof done === "function") {
      done();
    }
  }

  selectObject(name) {
    this.intersected = this.podium.getObjectByName(name);
  }

  toDataURL() {
    this.podium.save = {};
    this.podium.save.position = this.podium.position.toArray();
    this.podium.save.rotation = this.podium.rotation.toArray();
    this.podium.save.animation = this.podium.animation;
    this.podium.save.material = {};
    this.podium.save.material.visible = this.podium.material.visible;
    this.podium.position.set(0, 0, 0);
    this.podium.rotation.set(0, 0, 0);
    this.podium.animation = false;
    this.podium.material.visible = false;

    this.camera.save = {};
    this.camera.save.position = this.camera.position.toArray();
    this.camera.save.rotation = this.camera.rotation.toArray();
    this.camera.position.set(-25, 5, 0);
    this.camera.rotation.set(0, 0, 0);

    this.controls.save = {};
    this.controls.save.target = this.controls.target.toArray();
    this.controls.target = new THREE.Vector3(0, 4, 0);
    this.controls.update();

    this.onResize(640, 480);
    this.render();

    let screenshot = this.renderer.app.gl.domElement.toDataURL();

    this.podium.position.fromArray(this.podium.save.position);
    this.podium.rotation.fromArray(this.podium.save.rotation);
    this.podium.animation = this.podium.save.animation;
    this.podium.material.visible = this.podium.save.material.visible;

    this.camera.position.fromArray(this.camera.save.position);
    this.camera.rotation.fromArray(this.camera.save.rotation);

    this.controls.target.fromArray(this.controls.save.target);
    this.controls.update();

    this.onResize();
    this.render();

    return screenshot;
  }


}

export default Materials;