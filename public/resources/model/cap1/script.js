export class ModelScript {
    constructor( Renderer, loadMaterials, loadObject  ) {

        console.log( Renderer );

        loadMaterials(( materials ) => {
            loadObject(( obj )=>{
                Renderer.app.scene.add( obj );
                console.log( obj );
                Renderer.app.controls.update();
                Renderer.intersectsObjects.push( obj.children[0] );
                obj.children[0].dragThis = false;
                obj.children[0].geometry = new THREE.Geometry().fromBufferGeometry( obj.children[0].geometry );
                Renderer.iniObjectEvents( obj.children[0] );
            }, materials );
        });

    }
}
