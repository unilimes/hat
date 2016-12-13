import Zegla from './zegla.js';
import Util from './util.js';
import Materials from './materials.js';
import CanvasApi from './canvas-api.js';

class Renderer {
    /*@ngInject*/
    constructor($scope) {

        var self = this;

        this.hash = (window.location.hash.replace('#', '') !== '') ? window.location.hash.replace('#', '') : 'sliapa';
        this.path = 'resources/model/' + this.hash + "/";

        this.$container = $('#' + $scope);
        this.container = document.getElementById( $scope );
        this.$scope = $scope;

        this.CanvasApi = new CanvasApi();

        this.raycaster = new THREE.Raycaster();
        this.fontLoader = new THREE.FontLoader();
        this.textureLoader = new THREE.TextureLoader();
        this.MaterialProcessor = new Materials( this );
        this.color = '#cccccc';

        this.ModelScript = require('../../public/resources/model/' + this.hash + '/script.js').ModelScript;
        this.fontFromFile = false;

        this.intersectsObjects = [];
        this.config = { size: 0 };

        this.app = new Zegla('three_container');

        this.textureConfig = {
            roughness: 1.0,
            metalness: 0.0,
            aoMapIntensity: 1.0,
            spotLight: 2.8,
            hemiLight: 0.6,
            spotLightx: this.app.lights.spot1.position.x,
            spotLighty: this.app.lights.spot1.position.y,
            spotLightz: this.app.lights.spot1.position.z
        };

        this.materialsList = {};

        // Available Models list
        this.modelsList = [{
            name: 'choose model',
            val: "0"
        }, {
            name: 'Cap',
            val: "cap1"
        }, {
            name: 'Cup',
            val: "cup1"
        }, {
            name: 'Slapa',
            val: "sliapa"
        }, {
            name: 'Hoses',
            val: "hoses"
        }, {
            name: 'Abstract',
            val: "abstract1"
        }, {
            name: 'Books',
            val: "book1"
        }];

        this._modelsList = [];
        this._modelName = '';
        for( let i = 0; i < this.modelsList.length; i++ ){
            this._modelsList[i] = this.modelsList[i].name;
        }

        this.fontsList = (function(){

            let FontList = function(){};

            var fontsParams = [{
                name: 'helvetiker_bold',
                filename: 'helvetiker_bold.typeface.json'
            },
            {
                name: 'Digital-7_Regular',
                filename: 'Digital-7_Regular.json'
            },
            {
                name: 'English_Regular',
                filename: 'English_Regular.json'
            },
            {
                name: 'Edo_SZ_Regular',
                filename: 'Edo_SZ_Regular.json'
            },
            {
                name: 'Justice_Regular',
                filename: 'Justice_Regular.json'
            },
            {
                name: 'Blazed_Regular',
                filename: 'Blazed_Regular.json'
            },
            {
                name: 'Bleeding Cowboys_Regular',
                filename: 'Bleeding Cowboys_Regular.json'
            },
            {
                name: 'droid_sans_bold',
                filename: 'droid_sans_bold.typeface.json'
            },
            {
                name: 'droid_serif_bold',
                filename: 'droid_serif_bold.typeface.json'
            },
            {
                name: 'gentilis_bold',
                filename: 'gentilis_bold.typeface.json'
            },
            {
                name: 'optimer_bold',
                filename: 'optimer_bold.typeface.json'
            },
            {
                name: 'Felicitation_Arabic_fr',
                filename: 'Felicitation_Arabic_fr.json'
            }];

            FontList.prototype.get = function( name ){
                if( name ){
                    for(let i = 0; i < fontsParams.length; i++ ){
                        if( fontsParams[i].name === name ){
                            console.log( name, fontsParams[i].name, fontsParams[i].name === name );
                            return fontsParams[i];
                        }
                    }
                    return fontsParams[0];
                } else {
                    return fontsParams[0];
                }
            };

            FontList.prototype.getList = function(){
                var result = [];
                for( let i = 0; i < fontsParams.length; i++ ){
                    result.push( fontsParams[ i ].name );
                }
                return result;
            };

            FontList.prototype.getParams = function(){
                return fontsParams;
            };

            return new FontList();
        })();

        this.fontFace = this.fontsList.get().filename;
        this.fontFaceName = this.fontsList.get().name;

        this.run();
    }

    run () {
        this.preloadConfig(()=>{
            this.iniMaterials();
            this.iniAppObjects();
            this.iniDomObjesct();
            this.preloadModel();
            this.preloadFont();
            this.iniGUI();
        });

    }

    preloadConfig(callback) {
        $.get( 'resources/config/materials.json', ( resp, status ) => {
            this.materialsList = resp;
            console.log( resp );
            callback();

        });
    }

    iniMaterials(){

        let CategoryTemplate = _.template(`
            <div class="category-body">
                <div class="category-toggler">
                    <%- name %>
                </div>
                <div class="category-container hidden">
                  <span class="description">
                    <%- description %>
                  </span>
                  <div>
                    <% items.forEach( function(item, i ) { %>
                        <div class="material-item">
                            <img
                                class="material-item-icon"
                                data-materialgroup="<%- name %>"
                                data-materialitemindex="<%- i %>"
                                src=" resources/<%- item.image.small %>"
                                alt=" <%- item.name %>"
                                title=" <%- item.name %>">
                        </div>
                    <% }); %>
                  </div>
                </div>
            </div>
        `);

        for( var Key in this.materialsList ){
            $('#selectMaterial')
                .append( CategoryTemplate( this.materialsList[Key] ) );
        }

        $('.category-toggler').click((event) => {
            var element = event.target;
            var container = $(element).parent().find('.category-container');
            $('.category-container').addClass('hidden');
            container.toggleClass('hidden');
        });

        $('.material-item-icon').click(( event ) => {

            var element = event.target;

            var data = $(element).data();

            this.currentMaterialConfig = this.materialsList[ data.materialgroup ].items[ data.materialitemindex ];

            this.MaterialProcessor.setMaterial( this.currentIntersected, this.currentMaterialConfig, () => {
                console.log( this.currentMaterial );
            });

        });

    }

    iniGUI(){

        let self = this;

        this.gui = new dat.GUI({
            width: 360
        });

        var f1 = this.gui.addFolder('Light config');

        f1.add( this.textureConfig, 'roughness', -10, 10).onChange( () => {
            //mesh1.material.roughness =  this.textureConfig.roughness;
            //mesh2.material.roughness =  this.textureConfig.roughness;
        });
        f1.add( this.textureConfig, 'metalness', -10, 10).onChange( () => {
            //mesh1.material.metalness =  this.textureConfig.metalness;
            //mesh2.material.metalness =  this.textureConfig.metalness;
        });
        f1.add( this.textureConfig, 'aoMapIntensity', -10, 10).onChange( () => {
            //mesh1.material.aoMapIntensity =  this.textureConfig.aoMapIntensity;
            //mesh2.material.aoMapIntensity =  this.textureConfig.aoMapIntensity;
        });
        f1.add( this.textureConfig, 'spotLight', 0, 1).onChange( () => {
            this.app.lights.spot1.intensity =  this.textureConfig.spotLight;
        });
        f1.add( this.textureConfig, 'hemiLight', 0, 1).onChange( () => {
            this.app.lights.hemi.intensity =  this.textureConfig.hemiLight;
        });
        f1.add( this.textureConfig, 'spotLighty', -10000, 10000).onChange( () => {
            this.app.lights.spot1.position.y =  this.textureConfig.spotLighty;
        });
        f1.add( this.textureConfig, 'spotLightx', -10000, 10000).onChange( () => {
            this.app.lights.spot1.position.x =  this.textureConfig.spotLightx;
        });
        f1.add( this.textureConfig, 'spotLightz', -10000, 10000).onChange( () => {
            this.app.lights.spot1.position.z =  this.textureConfig.spotLightz;
        });

        // model params
        var f2 = this.gui.addFolder('Model config');
        f2.add( this, '_modelName',  this._modelsList ).onChange( () => {
            console.log( this._modelName );

            var val = 0;
            for( let i = 0; i < this.modelsList.length; i++ ){
                if( this.modelsList[i].name === this._modelName ){
                    val = this.modelsList[i].val;
                }
            }

            if(val !== 0){
                window.location.hash = val;
                window.location.reload();
            }

        });

        // to connect
        var f3 = this.gui.addFolder('Text config');

        f3.add( this.CanvasApi.options, 'text' ).onFinishChange( () => {
            self.fontReady();
        });

        f3.add( this.CanvasApi.options, 'size' ).step(1).max(46).min(1).onFinishChange( () => {
            self.fontReady();
        });

        f3.add( this, 'fontFaceName', this.fontsList.getList() ).onChange( () => {
            self.preloadFont();
        });

        f3.addColor( self, 'color' ).onChange( () => {
            _.each( self.textPointer.children, ( child ) => {
                child.material.color = new THREE.Color( self.color );
            });
        });

        //f3.add( self, 'upload ttf' );

    }

    preloadModel(){
        var self = this;
        var mtlLoader = new THREE.MTLLoader();
        function loadMaterials( callback ) {
            mtlLoader.setPath( self.path );
            mtlLoader.load( 'model.mtl', ( materials ) => {
                callback( materials );
            });
        }
        var objLoader = new THREE.OBJLoader();
        function loadObject( callback, materials ) {
            if( materials ) {
                materials.preload();
                objLoader.setMaterials( materials );
            }
            objLoader.setPath( self.path );
            objLoader.load( 'model.obj',  ( obj ) => {
                callback( obj );
            }, ()=>{}, ()=>{} );
        }
        this.mScript = new this.ModelScript( this, loadMaterials, loadObject );

    }

    iniDomObjesct(){

        this['upload ttf'] = function(){
            $('#fileInput').click();
        };

        // List available models in DOM
        _.each( this.modelsList, function( nextModel ){
            var nextOption = $('<option value="' + nextModel.val + '">' + nextModel.name + '</option>');
            $('#selectModel').append( nextOption );
        });

        // List available fonts in DOM
        //console.log( this.fontsList );
        //_.each( this.fontsList.getParams(), function( nextFont ){
        //    var nextOption = $('<option value="' + nextFont.name + '">' + nextFont.name + '</option>');
        //    $('#fontChoose').append( nextOption );
        //});

        var fileInput = document.getElementById("fileInput");
        fileInput.addEventListener('change', () => {
            //console.log( font );
            [].forEach.call( fileInput.files, ( file ) => {
                var reader = new FileReader();
                reader.addEventListener( 'load', ( event ) => {
                    var font = opentype.parse( event.target.result );
                    this.currentFont = this.fontLoader.parse( Util.convertTTF( font ) );
                    this.currentFont.data = JSON.parse( this.currentFont.data );
                    this.fontReady( this.currentFont );

                    this.fontFromFile = true;

                    console.log( this );

                }, false );
                reader.readAsArrayBuffer( file );
            });
        }, false );

    }

    iniAppObjects(){

        var self = this;

        var textTextureNormal = this.textureLoader.load('resources/textures/tkan1/normal.png');
        textTextureNormal.wrapS = textTextureNormal.wrapT = THREE.RepeatWrapping;
        textTextureNormal.repeat.set( 0.1, 0.1 );

        this.textMaterial = new THREE.MeshPhongMaterial({
            //map: textTexture,
            color: new THREE.Color('#cccccc'),
            normalMap: textTextureNormal
        });

        THREE.Chpok( this.app.container, this.app.camera, this.app.scene.children  );
        THREE.Object3D.prototype.clearChildren = function(){
            for( var i = 0; i < this.children.length; i++ ){
                if(this.children[ i ].material){
                    if(this.children[ i ].material.map){
                        this.children[ i ].material.map.dispose();
                    }
                    this.children[ i ].material.dispose();
                }
                if( this.children[ i ].geometry ){
                    this.children[ i ].geometry.dispose();
                }
                this.children[ i ].parent.remove( this.children[ i ] );
            }
            if( this.children.length > 0 ){ this.clearChildren(); }
        };

        this.textPointer = new THREE.Object3D();
        this.app.scene.add( this.textPointer );
        this.debugSpheresContainer = new THREE.Object3D();
        this.app.scene.add( this.debugSpheresContainer );
        this.app.camera.position.fromArray([ -415.0459936190199, 437.13332153995503, 623.9462502418111 ]);

    }

    iniObjectEvents( objForEvent ){

        var self = this;
        var modifier = new THREE.BendModifier();
        var onclickClearContainer = [];

        var mouseUp = ( test ) => {
            objForEvent.dragThis = false;
            this.app.controls.connect();
            objForEvent.removeEventListener( 'mouseup', mouseUp );
            document.removeEventListener( 'mouseup', mouseUp );
            if(test.inter){
                test.inter.event.stopPropagation();
                test.inter.event.preventDefault();
            } else {
                test.stopPropagation();
                test.preventDefault();
            }
            this.app.controls.enableRotate = true;
            return false;
        };

        var mouseDown = ( test ) => {
            objForEvent.dragThis = true;
            this.app.controls.enableRotate = false;
            this.app.controls.disconnect();
            test.inter.event.stopPropagation();
            test.inter.event.preventDefault();
            objForEvent.addEventListener( 'mouseup', mouseUp, false );
            document.addEventListener( 'mouseup', mouseUp, false );
            return false;
        };

        var mouseDrag = ( test )=>{
            if( objForEvent.dragThis ) {
                //console.log( test );
                test.inter.event.stopPropagation();
                test.inter.event.preventDefault();
            }
        };

        var mouseMove = () => {
            if( this.app.controls._state() === -1 ){
                this.app.controls.enableRotate = false;
            }
        };

        var mouseLeave = () => {
            this.app.controls.enableRotate = true;
        };

        var mouseClick = ( test ) => {

            this.currentIntersected = test.inter;

            var decals = [];
            var decalHelper, mouseHelper;

            //console.log( test );
            //console.log( 'click!' );

            var dir = this.app.controls.target.clone().sub( this.app.camera.position );

            function presetPosition( inter ) {

                let r = new THREE.Vector3(0, 0, 0);
                let up = new THREE.Vector3(0, 1, 0);
                let p = inter.point.clone();
                let f = inter.face.clone();
                let n = inter.face.normal.clone();

                let _normalMatrix = new THREE.Matrix3().getNormalMatrix(objForEvent.matrixWorld);
                let worldNormal = n.applyMatrix3(_normalMatrix).normalize();
                let c = dir.clone();
                c.multiplyScalar(10);
                c.add(p);

                let m = new THREE.Matrix4();
                m.lookAt(p, c, up);
                m = m.extractRotation(m);
                var dummy = new THREE.Object3D();
                dummy.rotation.setFromRotationMatrix(m);
                r.set(dummy.rotation.x, dummy.rotation.y, dummy.rotation.z);

                return {
                    p: p,
                    p2:  p.clone().add( worldNormal ),
                    worldNormal: worldNormal,
                    m: m
                };

            }

            let result = presetPosition( test.inter );

            this.textPointer.position.copy( result.p );
            this.textPointer.lookAt( result.p.clone().add( result.worldNormal ) );


            this.debugSpheresContainer.clearChildren();

            function createDebugSphere ( point, container ){
                container = container || self.debugSpheresContainer;
                let geo = new THREE.SphereGeometry( 5, 5, 5 );
                let mat = new THREE.MeshPhongMaterial({ color: self.color });
                let nextSphere = new THREE.Mesh( geo, mat );
                nextSphere.position.copy( point );
                container.add( nextSphere );
                return nextSphere;
            }

            var Children = [].concat( this.textPointer.children );

            for( let i = 0; i < Children.length; i++ ){

                var child = Children[i];
                    child.position.copy( child.startPosition );
                    child.rotation.copy( child.startRotation );

                var tmpObj = new THREE.Object3D();
                    tmpObj.rotation.copy( child.rotation );
                    tmpObj.position.copy( child.position );

                this.textPointer.add( tmpObj );

                this.app.scene.updateMatrixWorld();
                this.textPointer.updateMatrixWorld();
                    child.updateMatrixWorld();
                    tmpObj.updateMatrixWorld();

                var vector = new THREE.Vector3();

                vector.setFromMatrixPosition( tmpObj.matrixWorld );

                tmpObj.parent.remove( tmpObj );

                var tmpRotation = new THREE.Euler().setFromRotationMatrix ( tmpObj.matrixWorld );

                var rotation = this.textPointer.rotation.clone().toVector3().normalize();
                    this.raycaster.set( vector, test.inter.face.normal.clone().negate() );

                var inter = this.raycaster.intersectObjects( this.intersectsObjects, true );

                if( inter[0] ){

                    THREE.SceneUtils.detach( child, this.textPointer, this.app.scene );

                    let result = presetPosition( inter[0] );

                    child.position.copy( result.p );
                    child.lookAt( result.p.clone().add( result.worldNormal ) );
                    child.updateMatrixWorld();

                    THREE.SceneUtils.attach( child, this.app.scene, this.textPointer );

                }

            }

            var direction = new THREE.Vector3(0, 0, -1);
            var axis = new THREE.Vector3(0, 1, 0);
            var angle = Math.PI / 6;

        };

        console.log(  );

        objForEvent.addEventListener('mouseclick', mouseClick );
        objForEvent.addEventListener('mousemove', mouseMove );
        objForEvent.addEventListener('mouseleave', mouseLeave );
        objForEvent.addEventListener('mousedrag', mouseDrag );
        objForEvent.addEventListener('mousedown', mouseDown );

    }

    fontReady(){

        var self = this;
        var font = self.currentFont;

        console.log( font );

        self.textPointer.clearChildren();

        var textShapes = font.generateShapes(
            self.CanvasApi.options.text,
            self.CanvasApi.options.size,
            6 // curveSegments
        );

        var color = self.color ? self.color : '#cccccc';
        self.textMaterial.color = new THREE.Color( color );

        var extrudeSettings = {
            amount          : 1,
            steps			: 100,
            height          : 1,
            curveSegments   : 6,
            bevelEnabled	: false,
            font            : font
        };

        var geoms = [];
        var geomsToBoundingBoxes = textShapes.length;

        for( let i = 0; i < textShapes.length; i++ ){
            var geo = new THREE.ExtrudeGeometry( textShapes[i], extrudeSettings );
            geo.computeBoundingBox();
            geoms.push( geo );
        }

        var minmaxPoints = [];
        _.each( geoms, ( geo ) => {
            minmaxPoints.push( geo.boundingBox.min );
            minmaxPoints.push( geo.boundingBox.max );
        });
        var totalBox = new THREE.Box3().setFromPoints( minmaxPoints );

        self.config._center = totalBox.center();
        self.config._size = totalBox.size();
        self.config.size = self.config._size.clone().multiplyScalar( 0.5 );

        for( let i = 0; i < geoms.length; i++ ){

            let startPosition = geoms[i].boundingBox.center();

            let factor = self.config._center.clone().sub( startPosition );

            let nextLetter = new THREE.Mesh( geoms[i], self.textMaterial );

            geoms[i].translate( startPosition.negate().x, 0, startPosition.negate().z ) ;

            nextLetter.position.x = factor.negate().x;
            nextLetter.position.z = factor.negate().z;

            nextLetter.startPosition = nextLetter.position.clone();
            nextLetter.startRotation = nextLetter.rotation.clone();

            self.textPointer.add( nextLetter );
        }
    }


    preloadFont(){
        this.fontFace = this.fontsList.get( this.fontFaceName ).filename;
        this.fontFromFile = false;
        if( this.fontsList.get( this.fontFaceName ).font ){
            this.currentFont = this.fontsList.get( this.fontFaceName ).font;
            this.fontReady();
        } else {
            this.fontLoader.load( "resources/fontjson/" + this.fontFace, ( font ) => {
                this.fontsList.get( this.fontFaceName ).font = font;
                this.currentFont = font;
                this.fontReady();
            });
        }

    }

    paramsChanged( element, event ){

        var self = this;

        self.fontReady();
    }

    update(){

    }

    clear(){

    }
}

export default Renderer;