export class ModelScript {
    constructor( Renderer, loadMaterials, loadObject  ) {

        loadMaterials(( materials ) => {
            loadObject(( obj )=>{
                Renderer.app.scene.add( obj );
                console.log( obj );
                Renderer.app.controls.update();
                Renderer.intersectsObjects.push( obj.children[0] );
                obj.children[0].dragThis = false;
                console.log( 'TESTTEST: ', obj.children[0] );
                Renderer.iniObjectEvents( obj.children[0] );
            }, materials );
        });

        console.log( Renderer );

    }
}
