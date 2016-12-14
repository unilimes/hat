export class ModelScript {
    constructor( Renderer, loadMaterials, loadObject, callback ) {
        loadObject(( obj )=>{
            if( callback )  callback( obj );
        }, false );
    }
}
