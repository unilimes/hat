export class ModelScript {
    constructor( Renderer, loadMaterials, loadObject  ) {

        loadMaterials(( materials ) => {
            loadObject(( obj )=>{

                Renderer.app.scene.add( obj );

                Renderer.app.controls.update();

                _.each( obj.children, ( child ) => {
                    //child.material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
                    Renderer.intersectsObjects.push( child );
                    child.dragThis = false;
                    Renderer.iniObjectEvents( child );
                });

            }, materials );
        });

        console.log( Renderer );

    }
}
