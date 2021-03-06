import Instruction from './instruction.js';

class Zegla {

  constructor( containerID ) {

    this._ = {};
    containerID = containerID || 'three_container';
    this.parentContainer = document.getElementById(containerID);
    this.container = {};
    this._.Instruction = Instruction;
    this.Animations = new Instruction();
    this.scene = new THREE.Scene();
    this._scene = new THREE.Object3D();
    this.scene.add( this._scene );
    this.frame = 0;
    this.stats = new Stats();
    this.stats.showPanel( 0 );
    console.log( this.stats );

    // inits
    this.iniView();
    this.iniCamera();
    this.iniGL();
    this.iniControls();
    this.iniFog();
    this.iniLight();
    this.iniAnimations();
  }

  iniView(){
    this.View = {
      _SW: () => {
        return this.parentContainer.offsetWidth;
      },
      _SH: () => {
        return this.parentContainer.offsetHeight;
      },
      view_angle: 45,
      aspect: () => {
        return this.View._SW() / this.View._SH();
      },
      near: 0.1,
      far: 30000,
      center: new THREE.Vector3(-0.5, 3, -0.5),
      resize: (event) => {
        this.gl.setSize( this.View._SW(), this.View._SH() );
        this.camera.aspect = this.View.aspect();
        this.camera.updateProjectionMatrix();
      }
    };
    window.addEventListener("resize", this.View.resize, false);
  }

  onFrame(){
    this.stats.begin();
    this.frame++;
    this.gl.render(this.scene, this.camera);
    this.Animations.run();
    document.body.appendChild( this.stats.dom );
    this.stats.end();
  }

  iniAnimations(){
    this.Animate = () => {
      this.onFrame();
      requestAnimationFrame( this.Animate);
    };
    this.Animate();
  }

  iniGL(){

    this.gl = new THREE.WebGLRenderer({
      clearAlpha: 1,
      antialias: true,
      sortObjects: false
    });

    this.gl.setPixelRatio( window.devicePixelRatio );
    this.gl.setClearColor( 0xdcdcdc );
    this.gl.setSize( this.View._SW(), this.View._SH());
    this.gl.sortObjects = true;
    this.container = this.gl.domElement;
    this.parentContainer.appendChild(this.container);
  }

  iniFog(){
    //FOG INI
    this.scene.fog = new THREE.Fog('#ffffff', 5, 50000000000);
  }

  iniLight(){

    let scene = this.scene;

    this.lights = {
        //ambient: new THREE.AmbientLight( 0xffffff ),
        spot1: new THREE.SpotLight(0xffffff, 0.82),
        spot2: new THREE.SpotLight(0xffffff, 1.42),
        spot3: new THREE.SpotLight(0xffffff, 1.42),
        point: new THREE.PointLight( 0xffffff, 1, 30 ),
        hemi: new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.06)
    };

    this.lights.spot1.lookAt(scene.position);
    this.lights.spot1.position.y = 1000;
    this.lights.spot1.penumbra = 0.05;
    this.lights.spot1.decay = 2;
    this.lights.spot1.distance = 1000;
    this.lights.spot1.shadow.mapSize.width = 1024;
    this.lights.spot1.shadow.mapSize.height = 1024;
    this.lights.spot1.shadow.camera.near = 1;
    this.lights.spot1.shadow.camera.far = 20000;
    this.scene.add( this.lights.spot1 );

    this.lights.spot2.position.set(-1000, -889, 1000);
    this.lights.spot2.angle = 1.6;
    this.lights.spot2.penumbra = 0.05;
    this.lights.spot2.decay = 2;
    //        spotLight.castShadow = true;
    this.lights.spot2.distance = 3000;
    this.scene.add( this.lights.spot2 );


    this.lights.spot3.position.copy( this.camera.position );
    this.lights.spot3.angle = 1.6;
    this.lights.spot3.penumbra = 0.05;
    this.lights.spot3.decay = 2;
    this.lights.spot3.castShadow = true;
    this.lights.spot3.distance = 3000;
    this.scene.add( this.lights.spot3 );

    this.lights.hemi.position.set( 500, 500, 0 );
    this.scene.add( this.lights.hemi );


  }

  iniCamera(){
    // CAMERA INI
    this.camera = new THREE.PerspectiveCamera(
        this.View.view_angle,
        this.View.aspect(),
        this.View.near,
        this.View.far
    );
    this.camera.position.set(-0.5, 5, -0.5);
    this.scene.add(this.camera);
  }

  iniControls(){
    // CONTROLS INI
    this.controls = new THREE.OrbitControls( this.camera, this.gl.domElement);
    this.controls.enablePan = true;
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.controls.minDistance = 0.3;
    this.controls.maxDistance = 11110.3;
  }

  deepMapper( scene ){

    scene.deep = 0;

    var responseProto = function(){
      this.map = []; this.map[0] = [];
      this.stack = [];
      this.count = 0;
      this.traverseUp = function( callback ){
        for( var i = this.map.length; i > 0; i-- ){
          for(var n = this.map[i-1].length; n > 0; n--){
            if(callback) callback( this.map[i-1][n-1] );
          }
        }
      };
    };

    var response = new responseProto();

    var Map = response.map;
    var Stack = response.stack;
    function deep_marker_childs( obj ){
      for( var i = 0; i < obj.children.length; i++ ){
        obj.children[i].deep = obj.deep+1;
        if(!Map[ obj.children[i].deep ]) Map[ obj.children[i].deep ] = [];
        Map[ obj.children[i].deep ].push( obj.children[i] );
        Stack.push( obj.children[i] );
        deep_marker_childs( obj.children[i] );
      }
    }
    deep_marker_childs( scene );
    return response;
  }


  clearScene(){

    let sceneMap = this.deepMapper( this._scene );

    console.log( sceneMap );

    sceneMap.traverseUp(( child ) => {
      if( child.material && child.material.map ) child.material.map.dispose();
      if( child.material ) {
        if( child.material.dispose ){
          child.material.dispose();
        } else {
          if( child.material.materials ){
            for( let i = 0; i < child.material.materials.length; i++ ){
              if( child.material.materials[i].map ) child.material.materials[i].map.dispose();
              if( child.material.materials[i] ) child.material.materials[i].dispose();
            }
          }
        }
      }
      if( child.geometry) child.geometry.dispose();
      child.parent.remove( child );
    });
  }

}

export default Zegla;