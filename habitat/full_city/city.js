
//https://github.com/mapbox/earcut
var w = window.innerWidth;
var h = window.innerHeight;
var scene, camera, renderer, mesh, group;

 var lat, lng;

//PARIS
// lat = 48.8534100;
// lng =  2.3488000;

//LONDON
//lat = 51.5085300;
//lng = -0.1257400;

//BERLIN
//lat = 52.5243700;
//lng = 13.4105300;

//NYC
//lat = 40.7142700;
//lng = -74.0059700;

//SAN FRANCISCO
// lat = 37.773972;
// lng = -122.431297;

//SUZHOU
lat = 31.327620;
lng = 120.715971;

var zl = 13;

var start = 0;
var controls, skybox, light;

window.onload = function() {

    scene = new THREE.Scene();
    //scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.00005 );
    camera = new THREE.PerspectiveCamera( 60, w / h,1, 100000 );

    renderer = new THREE.WebGLRenderer({logarithmicDepthBuffer:true});
    renderer.setSize(w, h);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls( camera );


    scene.add( new THREE.AmbientLight( 0x101010 ) );
    light = new THREE.PointLight(0xFFFFFF, 1 );
    scene.add( light );

    var xy = map.mercator.latLonToMeters( -lat, lng, map.zoom);

    
    // camera.position.x = -13640768.438104622;
    // camera.position.y = 14615.668647974027;
    // camera.position.z = -4528503.340282675;
    //dingyh: 
    camera.position.x = xy[0];
    camera.position.y = 14615.668647974027;
    camera.position.z = xy[1];

    controls.target.x = xy[0];
    controls.target.z = xy[1];
    camera.lookAt( controls.target );



    var size = 2048;

    //skybox texture from http://www.keithlantz.net/2011/10/rendering-a-skybox-using-a-cube-map-with-opengl-and-glsl/
    skybox = new Skybox( "img/skybox_texture.jpg", 512, 0, function(){

         //dino.init( scene, camera, xy, skybox.cubeMap );
         //dinoLoaded = true;
         //camera.position.set( -13629938.83783227, 100, -4545704.796943032 );
         //controls.target.set( -13627973.806908408, 1040.3513288190197, -4547575.779487265 );
         //controls.update();
         ///*
         
        //dingyh 
        // if( skybox.mesh ){
        //     skybox.mesh.position.x = xy[0];
        //     skybox.mesh.position.z = xy[1];
        //     scene.add( skybox.mesh );
        // }

        materials.init( skybox.cubeMap );

        builder.init( scene );
        //dingyh
        // water.init( function(){

        //      land.init( scene, size, xy, function(){

        //          map.init( size, true );

        //          map.eventEmitter.on( Map.ON_LOAD_COMPLETE, loadTaxis );

        //          map.setView( lat, lng, zl );

        //      });
        // });
        land.init( scene, size, xy, function(){

            map.init( size, true );

            map.eventEmitter.on( Map.ON_LOAD_COMPLETE, loadTaxis );

            map.setView( lat, lng, zl );

        });

    } );
    start = Date.now();
    update();

};

//init taxi lines when the rest is loaded
function loadTaxis( status ){
    if(status==0 ){
        map.eventEmitter.removeListener( Map.ON_LOAD_COMPLETE, loadTaxis );
        //dingyh: load taxis data
        taxis.init( scene, camera );
    }
}

window.onresize = function()
{
    w = window.innerWidth;
    h = window.innerHeight;
    renderer.setSize( w,h );
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
};

function update(){

    requestAnimationFrame(update);

    //reloads map as we move around
    var ll = map.mercator.metersToLatLon( controls.target.x, -controls.target.z, map.zoom);
    map.setView( ll[0], ll[1] );

    camera.position.y = Math.max( 100,camera.position.y );
    light.position.copy( camera.position );
    light.position.y += 1000;

    materials.update();
    taxis.update();

    if(dinoLoaded)dino.update();
    if( driveTaxi )
    {
        var t = ( Date.now() - start ) * 0.0000001;
        taxis.updateTaxiCam( t%1 );
        renderer.render( scene, taxis.taxiCamera );

    }else{
        renderer.render( scene, camera );
    }

}

var coolSpotId = 0;
var coolspots = [
    [new THREE.Vector3(-13634119.075526413, 6928.38777668248, -4536967.009088654), new THREE.Vector3(-13627789.64084282, -389.02672688848816, -4545023.4563437)],
    [new THREE.Vector3(-13626491.56450185, 4771.453392986968, -4544497.95139611), new THREE.Vector3(-13626491.571370194, -2413.5008303714812, -4544497.953505475)],
    [new THREE.Vector3(-13615287.016125113, 11289.814569153757, -4563714.717312772), new THREE.Vector3(-13627382.382659353, -18649.486513917214, -4536562.620757105)],
    [new THREE.Vector3(-13621737.562983958, 2214.930637063653, -4524253.613592281), new THREE.Vector3(-13622872.738791045, 1174.900458906489, -4525601.029004181)],
    [new THREE.Vector3( -13592056.269375548, 25439.426112008114, -4529696.62061971), new THREE.Vector3(-13607005.638437591, 4628.987184153297, -4536065.006421128)],
    [new THREE.Vector3( -13622902.071238825, 2911.5736291728754, -4544560.1181047475), new THREE.Vector3(-13625080.742232792, 194.47399651236242, -4546978.620476511)],
    [new THREE.Vector3( -13638889.712183785, 2149.404140946531, -4548430.054856324), new THREE.Vector3(-13632082.978216551, -3069.5799685214715, -4544598.951092867)],
    [new THREE.Vector3( -13634701.352885144, 2375.181032134179, -4527908.76688087), new THREE.Vector3(-13627602.066840833, -4985.197181545745, -4539271.076151813)],
    [new THREE.Vector3( -13629938.83783227, 100, -4545704.796943032), new THREE.Vector3(-13627973.806908408, 1040.3513288190197, -4547575.779487265)]
];
function bright(){
    materials.bright();
    taxis.bright();
    if( dinoLoaded )dino.bright();
}
function dark(){
    materials.dark();
    taxis.dark();
    if( dinoLoaded )dino.dark();
}
var driveTaxi = false;
var dinoLoaded = false;
document.body.addEventListener("keyup", function(e) {

    if(e.keyCode == 65 ){
        start = Date.now();
        taxis.nextTaxi();
        driveTaxi = !driveTaxi;
    }
    if(e.keyCode == 66 ){
        bright();
    }
    if(e.keyCode == 67 ) {
        dark();
    }
    if(e.keyCode == 68 ) {

        if( !dinoLoaded ){

            var lat = 37.773972;
            var lng = -122.431297;
            var xy = map.mercator.latLonToMeters( -lat, lng, 13 );
            dino.init( scene, camera, xy, skybox.cubeMap );
            camera.position.set( -13630543.622608025, 100, -4545743.068301543 );
            controls.target.set( -13627973.806908408, 1040.3513288190197, -4547575.779487265 );
            controls.update();

            dinoLoaded = true;
        }
    }
    if(e.keyCode == 32 ){
        camera.position.copy( coolspots[ coolSpotId ][0] );
        controls.target.copy( coolspots[ coolSpotId ][1] );
        controls.update();
        coolSpotId++;
        coolSpotId %= coolspots.length;
    }
}, false);
