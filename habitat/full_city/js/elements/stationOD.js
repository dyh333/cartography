var stationOD = function( exports ){


    var curveArray=[];
    var tween, tweenArray =[];
    var stationGroup, stationCamera;
    var lineGroup, ballGroup;
    var tg = new THREE.Vector3();

    var levelH = 10; //水平基准高度
    var curveH = 1000;

    // var stations = [
    //     '../../taxi/busstationdata/sip_bus_stations.txt'
    // ];
    

    exports.reset = function(){
        for (var i = stationGroup.children.length - 1; i >= 0; i--) {
            stationGroup.remove(stationGroup.children[i]);
        }
        
        for (var i = 0; i < cloneGroup.children.length; i++) {
            var mesh = cloneGroup.children[i].clone();
            mesh.material.color = new THREE.Color( "hsl(60, 100%, 50%)" );
            stationGroup.add(mesh);
        }
    }

    exports.init = function( group, camera ){ 
        
        
        stationGroup = group;
        
        lineGroup = new THREE.Group();
        lineGroup.name = 'lineGroup';
        stationGroup.add(lineGroup);
        ballGroup = new THREE.Group();
        ballGroup.name = 'ballGroup';
        stationGroup.add(ballGroup);
        
        
    };

    exports.showStationOD = function(stationId) {
        if(tween !== undefined) {
            tween.stop();
            // TWEEN.remove(tween);

            for (var i = lineGroup.children.length - 1; i >= 0; i--) {
                lineGroup.remove(lineGroup.children[i]);
            }
            curveArray = [];
        }

        // var stationId = '008a902c-166e-bd5c-f18b-cf4d8526bb55';
        var stations_od = [
            '../../taxi/busstationdata/sip_bus_stations_od_20161212.txt'
        ];
        
        var station = new XMLHttpRequest();
        station.onload = function(e){
            var vertices = e.target.responseText.split( '\n' ).map(function( s, i ) {
                
                var splitArray = s.split(',');

                if(splitArray[0] !== stationId){
                    return;
                }

                var ll_o = [parseFloat(splitArray[1]), parseFloat(splitArray[2])];
                var xy_o = map.mercator.latLonToMeters( -ll_o[0], ll_o[1], map.zoom);

                var ll_d = [parseFloat(splitArray[4]), parseFloat(splitArray[5])];
                var xy_d = map.mercator.latLonToMeters( -ll_d[0], ll_d[1], map.zoom);

                var curve = new THREE.CatmullRomCurve3([
                    new THREE.Vector3( xy_o[0], 10, xy_o[1] ),
                    new THREE.Vector3( (xy_o[0] + xy_d[0])/2, levelH+curveH, (xy_o[1] + xy_d[1])/2 ),
                    new THREE.Vector3( xy_d[0], 10, xy_d[1] )
                ]);
                
                var geometry = new THREE.Geometry();
		        // geometry.vertices = curve.getPoints( 50 );

                var curveModelData = curve.getPoints(50); 
                geometry.vertices = curveModelData.slice(0, 1);
                
                
                var material = new THREE.LineBasicMaterial( { 
                    color: new THREE.Color( "hsl(60, 100%, 50%)" ), 
                    opacity: 1, 
                    linewidth: 1 
                    // , vertexColors: THREE.VertexColors 
                } );
               
                var curveObject = new THREE.Line( geometry, material );
                curveObject.geometry.verticesNeedUpdate = true;  
                var meshUserData = new Object();
                meshUserData.curveModelData = curveModelData;
                curveObject.userData = meshUserData;

		        lineGroup.add(curveObject);
                curveArray.push(curveObject);



                tween = new TWEEN.Tween({endPointIndex:1})  
                            .to({endPointIndex: 50}, 3000)  
                            .onUpdate(function(){
                                var endPointIndex = Math.ceil(this.endPointIndex);
                    // console.log(endPointIndex);
                                var curvePartialData = new THREE.CatmullRomCurve3(curveModelData.slice(0, endPointIndex));  
                                curveObject.geometry.vertices = curvePartialData.getPoints(50);
                                curveObject.geometry.verticesNeedUpdate = true;  

                            })
                            .repeat( Infinity )
                            // .start();
                // tweenArray.push(tween);

                tween.start();


                //little ball
                // var blllGeo = new THREE.SphereGeometry(20);
                // var ballMaterial = new THREE.MeshBasicMaterial( {color: new THREE.Color( "hsl(8, 86%, 50%)" )} );
                // var sphere = new THREE.Mesh( blllGeo, ballMaterial );
                // sphere.position.set(xy_o[0], 10, xy_o[1]);

                // var meshUserData = new Object();
                // meshUserData.orgin = new THREE.Vector3( xy_o[0], 10, xy_o[1] );
                // meshUserData.destination = {x: [(xy_o[0] + xy_d[0])/2, xy_d[0]], y: [levelH+curveH, levelH], z: [(xy_o[1] + xy_d[1])/2, xy_d[1]]};  
                // sphere.userData = meshUserData;

                // ballGroup.add( sphere );
 
            });           
        };

        station.open( "GET", stations_od.shift() );
        station.send();
    }

    exports.startTween = function(){
        // var ballGroup = stationGroup.getObjectByName('ballGroup');
        // _.each(ballGroup.children, function (mesh, idx) {
        //     var userData = mesh.userData;
        //     // console.log(userData);
        //     var tween = new TWEEN.Tween( mesh.position ).to( { 
        //         x: userData.destination.x, 
        //         y: userData.destination.y, 
        //         z: userData.destination.z }, 3000 )
        //     .repeat( Infinity )
        //     .interpolation( TWEEN.Interpolation.CatmullRom )
        //     .easing( TWEEN.Easing.Linear.None ).start();
        // });

        var lineGroup = stationGroup.getObjectByName('lineGroup');
        // _.each(lineGroup.children, function (line, idx) {
            // var line = curveArray[0];

            var curveModelData = curveArray[0].userData.curveModelData;


            // var tween = new TWEEN.Tween({endPointIndex:1})  
            //                 .to({endPointIndex: 50}, 10000)  
            //                 .onUpdate(function(){
            //                     var endPointIndex = Math.ceil(this.endPointIndex);
            //         // console.log(endPointIndex);
            //                     var curvePartialData = new THREE.CatmullRomCurve3(curveModelData.slice(0, endPointIndex));  
            //                     curveArray[0].geometry.vertices = curvePartialData.getPoints(50);
            //                     curveArray[0].geometry.verticesNeedUpdate = true;  

            //                 })
            //                 // .repeat( Infinity )
            //                 .start();


        // });
        tween.start();
    };

    var start = Date.now();
    exports.update = function(){
        var t = ( Date.now() - start )  * 0.001;
        stationMaterials.forEach(function( m, i ){
            m.opacity = ( .5 + Math.sin( t + Math.PI * 2 * stationTime[i] ) * .5 ) * .1;
        });
    };

    return exports;

}({});