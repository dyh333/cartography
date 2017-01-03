var water = function(exports){

    exports.init = function( cb ){

        var water = new XMLHttpRequest();
        water.onload = function(e){
            // console.log(e.target.responseText);
            var json = JSON.parse(e.target.responseText );
            // console.log(json);

            builder.buildBlocks( null, "water", json );
            if( cb )cb();
        };

        //dingyh
        // water.open( "GET", 'data/extracts/sf_water.geojson' );
        // water.open( "GET", 'data/extracts/jjh_water.geojson' );
        // water.open( "GET", 'data/extracts/dsh_water.geojson' );
        water.open( "GET", 'data/extracts/hole.geojson' );
        water.send();

    };
    return exports;

}({});