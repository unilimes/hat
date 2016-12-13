export class ModelScript {
    constructor( Renderer, loadMaterials, loadObject  ) {

        loadObject(( obj )=>{

            Renderer.app.scene.add( obj );
            Renderer.app.controls.update();

            _.each( obj.children, ( child ) => {
                child.material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
                Renderer.intersectsObjects.push( child );
                child.dragThis = false;
                Renderer.iniObjectEvents( child );
            });

        }, false );

        console.log( Renderer );

    }
}
