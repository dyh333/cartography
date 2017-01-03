var materials = function( exports ){

    var loader = new THREE.TextureLoader();
    var waterNormal;
    exports.init = function( cubeMap ){


        exports[ "water" ] =new THREE.MeshPhongMaterial({

            color:0x444444,

            emissive:0x000000,
            envMap:cubeMap,
            reflectivity:1.5,
            shininess:50,

            side:THREE.DoubleSide,
            shading:THREE.FlatShading

        });

        //water normal texture from the internet...
        waterNormal = loader.load( "img/water_normal.png", function(){

            waterNormal.wrapS = waterNormal.wrapT = THREE.RepeatWrapping;
            waterNormal.repeat.x = 12000;
            waterNormal.repeat.y = 4000;
            waterNormal.needsUpdate = true;

            exports[ "water"].normalMap = waterNormal;
            exports["water"].needsUpdate = true;

        });

        exports[ "buildings" ] =new THREE.MeshPhongMaterial({

            color:0x666666,
            emissive:0x000000,
            //dingyh
            // envMap:cubeMap,
            reflectivity:1.5,
            refractionRatio:.5,
            shininess:20,
            shading:THREE.FlatShading

        });

        exports[ "landuse" ] = new THREE.MeshPhongMaterial({

            color:0x00CC99,
            emissive:0x000000,
            envMap:cubeMap,
            reflectivity:.5,
            shading:THREE.FlatShading

        });
        exports[ "extra_land" ] = new THREE.MeshBasicMaterial({color: 0x101010 });

        exports.dark();
    };

    exports.update = function(){

        //ripples
        if( waterNormal ){

            var t = Date.now() * 0.0005;
            waterNormal.offset.y -= 0.001;
            exports["water"].normalScale.x = ( Math.cos( t ) );
            waterNormal.needsUpdate = true;

        }
    };

    exports.bright = function() {

        exports["water"].color = new THREE.Color(0x0099CC);
        exports["water"].emissive = new THREE.Color(0xAAAAAA);
        exports["water"].reflectivity = .25;
        exports["water"].shininess = 100;

        exports["buildings"].color = new THREE.Color(0xEEEEEE);
        exports["buildings"].emissive = new THREE.Color(0x808080);
        exports["buildings"].reflectivity = .5;
        exports["buildings"].shininess = 1;

        exports["landuse"].color = new THREE.Color(0x009999);
        exports["extra_land"].color = new THREE.Color(0xBBBBBB );
    }

    exports.dark = function(){
        exports[ "water"].color = new THREE.Color( 0x444444 );
        exports["water"].emissive = new THREE.Color(0x101010);
        exports[ "water"].reflectivity = 1.5;
        exports["water"].shininess = 50;

        exports[ "buildings"].color = new THREE.Color( 0x666666 );
        exports[ "buildings"].emissive = new THREE.Color(0x101010);
        exports[ "buildings"].reflectivity = 1.5;
        exports[ "buildings"].shininess = 10;

        exports[ "landuse"].color = new THREE.Color( 0x00CC99);
        exports[ "extra_land"].color = new THREE.Color( 0x101010 );
    };

    return exports;
}({});
