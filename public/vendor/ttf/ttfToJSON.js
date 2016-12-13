
window.onload = function (){




    var exportString = function ( output, filename ) {

            //var blob = new Blob( [ output ], { type: 'text/plain' } );
            //var objectURL = URL.createObjectURL( blob );
            //
            //var link = document.createElement( 'a' );
            //link.href = objectURL;
            //link.download = filename || 'data.json';
            //link.target = '_blank';
            ////link.click();
            //
            //var event = document.createEvent("MouseEvents");
            //    event.initMouseEvent(
            //        "click", true, false, window,
            //        0, 0, 0, 0, 0,
            //        false, false, false, false, 0, null
            //    );
            //    link.dispatchEvent(event);
        };

    var reverseCommands = function(commands){

        var paths = [];
        var path;

        commands.forEach(function(c){
            if (c.type.toLowerCase() === "m"){
                path = [c];
                paths.push(path);
            } else if (c.type.toLowerCase() !== "z") {
                path.push(c);
            }
        });

        var reversed = [];
        paths.forEach(function(p){
            var result = {"type":"m" , "x" : p[p.length-1].x, "y": p[p.length-1].y};
            reversed.push(result);

            for(var i = p.length - 1;i > 0; i-- ){
                var command = p[i];
                result = {"type":command.type};
                if (command.x2 !== undefined && command.y2 !== undefined){
                    result.x1 = command.x2;
                    result.y1 = command.y2;
                    result.x2 = command.x1;
                    result.y2 = command.y1;
                } else if (command.x1 !== undefined && command.y1 !== undefined){
                    result.x1 = command.x1;
                    result.y1 = command.y1;
                }
                result.x =  p[i-1].x;
                result.y =  p[i-1].y;
                reversed.push(result);
            }

        });

        return reversed;

    };


}