export class Loader {
    constructor() {
        this.obj = new THREE.OBJLoader();
        this.mtl = new THREE.MTLLoader();

        this.textures = {};
        this.shaders = {};
    }

    loadModel(model, options, done) {
        let name = model.split("/").pop();
        let path = `resources/${model.substring(0, model.lastIndexOf("/"))}/`;

        this.mtl.setPath(path);
        this.mtl.load(`${name}.mtl`, (materials) => {
            materials.preload();

            for (let key in materials.materials) {
                let material = materials.materials[key];

                material.shading = THREE.SmoothShading;
                material.side = THREE.DoubleSide;
            }

            this.obj.setMaterials(materials);
            this.obj.setPath(path);
            this.obj.load(`${name}.obj`, (object) => {
                object.name = options.name || "Shoes";

                object.position.fromArray(options.position || [0, 0, 0]);
                object.rotation.fromArray(options.rotation || [0, 0, 0]);
                object.scale.set(options.scale || 1, options.scale || 1, options.scale || 1);

                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.current = {};

                        child.original = {};
                        child.original.material = child.material.clone();

                        child.receiveShadow = false;
                        child.castShadow = true;
                    }
                });

                done(object, materials.materials);
            });
        });
    }

    loadTexture( file, done ) {



        file = `resources/${file}`;

        if (this.textures[file]) {
            if (typeof done === "function") {
                done(this.textures[file]);
            }

            return this.textures[file];
        } else {
            this.textures[file] = new THREE.TextureLoader().load( file, (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);

                this.textures[file] = texture;

                if (typeof done === "function") {
                    done(this.textures[file]);
                }
            });

            return this.textures[file];
        }
    }

    loadShader(file, done) {
        if (this.shaders[file]) {
            if (typeof done === "function") {
                done(this.shaders[file].vertex, this.shaders[file].fragment);
            }
        } else {
            let vertexRequest = new XMLHttpRequest();
            let fragmentRequest = new XMLHttpRequest();

            let onload = () => {
                if (vertexRequest.responseText && fragmentRequest.responseText) {
                    this.shaders[file] = {
                        vertex: vertexRequest.responseText,
                        fragment: fragmentRequest.responseText
                    };

                    if (typeof done === "function") {
                        done(this.shaders[file].vertex, this.shaders[file].fragment);
                    }
                }
            };

            vertexRequest.onload = onload;
            vertexRequest.open("get", `resources/${file}/vertex.glsl`, false);
            vertexRequest.send();

            fragmentRequest.onload = onload;
            fragmentRequest.open("get", `resources/${file}/fragment.glsl`, false);
            fragmentRequest.send();
        }

        return this.shaders[file];
    }
}
