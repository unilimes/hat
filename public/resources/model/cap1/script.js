export class ModelScript {
    constructor( Renderer, loadMaterials, loadObject, callback ) {
        loadMaterials(( materials ) => {
            loadObject(( obj )=>{
                if( callback )  callback( obj );
            }, materials );
        });
    }
}
