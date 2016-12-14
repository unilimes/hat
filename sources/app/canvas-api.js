class CanvasApi {
    /*@ngInject*/
    constructor() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        this.options = {
            text: 'My test text',
            color: '#cccccc',
            "stroke-color" : '',
            stroke : false,
            size : 10,
            family : "Tahoma",
            bold: false,
            italic: false,
            underline: false
        };
    }

    getText () {

        //this.canvas


    }

    update(){

    }

    clear(){

    }
    stylePresetDetail( params ){

        params = params || this.options;

        var Style = '';
        var result = {
            total: '',
            bold: '',
            italic: '',
            underline: '',
            size: '',
            family: ''
        };

        if(params.family == "MS Shell Dlg") {
            params.family = "MS Sans Serif";
        } else if( [ "MS Shell Dlg 2", "ItalicT" ].indexOf(params.family) != -1){
            params.family = "Tahoma";
        }

        if(params.bold){
            result.bold = 'Bold ';
        }

        if(params.italic){
            result.italic = 'Italic ';
        }

        // "Underline" params isn't work for canvas text - so do it by line

        if(params.underline){
            result.underline = true;
        }

        result.size = parseInt(params.size) + 'px ';

        if(params.family){
            result.family =  "'" +params.family + "'";
        } else {
            result.family =  "'Arial'";
        }

        result.withoutFamily = result.bold + result.italic + result.size;

        result.total = result.withoutFamily + result.family;

        return result;
    }

    contextOptions( ctx, options ){
        ctx = ctx || this.context;
        options = this.options;
    }

    getMetrik(){
        var tmpCTX = (document.createElement('canvas')).getContext('2d');
        tmpCTX.font = this.stylePresetDetail().total;
        return tmpCTX.measureText( this.options.text );
    }

    changeOptions( option, val ){
        if( option in this.options ){
            this.options[ option ] = val;
        }
        var next = this.getMetrik();
    }
}

export default CanvasApi;