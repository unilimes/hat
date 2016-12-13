process.on( 'message', function (data) {

    data = JSON.parse( data );

    var i = 0;

    while ( i < data.count ) { i++; }

    process.send('processing complete');

    process.exit();

});
