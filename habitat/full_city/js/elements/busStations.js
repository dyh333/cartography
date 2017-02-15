var busStations = function( exports ){


    var renderTaxi = false;
    var stationCurveId = 2;
    var stationCurves = [];
    var stationMaterials = [];
    var stationTime = [];
    var stationGroup, cloneGroup, stationCamera;
    var domEvents;
    var tg = new THREE.Vector3();

    var minCount = 0, maxCount = 312; //菁英公寓
    var minCylinderH = 0, maxCylinderH = 600;
    var baseH = 1; //基础高度，所有高度都与它比计算scale
    var levelH = 10; //水平基准高度

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

    exports.init = function( group, camera, renderer ){
        var stationsFlow = [
            '../../taxi/busstationdata/sip_bus_station_flow_quarter_20161212.txt'
        ];
        
        stationGroup = group;
        cloneGroup = new THREE.Group();
        domEvents = new THREEx.DomEvents(camera, renderer.domElement);
        exports.stationCamera = camera.clone();//new THREE.PerspectiveCamera( 40, camera.aspect, .1, 10000000 );

        var tot = stationsFlow.length;
        var station = new XMLHttpRequest();
        station.onload = function(e){
            var vertices = e.target.responseText.split( '\n' ).map(function( s, i ) {
                var geom = new THREE.Geometry();

                var splitArray = s.split(',');
                var ll = [parseFloat(splitArray[3]), parseFloat(splitArray[4])];

                var xy = map.mercator.latLonToMeters( -ll[0], ll[1], map.zoom);
                geom.vertices.push( new THREE.Vector3( xy[0], 10, xy[1] ) );

                // return ll;

                // var col  = ~~( ( ( tot-stations.length ) / tot ) *  60 );
                var col = 60;
                
                /** create points **/
                // var stationMaterial = new THREE.PointsMaterial( { 
                //     size: 1, 
                //     color: new THREE.Color( "hsl("+ col +", 100%, 50%)" ), 
                //     sizeAttenuation: false,
                //     transparent:true
                // } );

                // var m = new THREE.Points( geom, stationMaterial );

                // group.add( m );
                /** create points ---end **/

                /** create cylinder **/
                var initCount = _.drop(splitArray, 5)[0]; //6点的值
                // var height = (maxCylinderH - minCylinderH)/(maxCount-minCount)*(initCount-minCount);  //*2 太低了
 
                
                var cylinderGeo = new THREE.CylinderGeometry(20, 20, baseH);

                var stationMaterial = new THREE.MeshPhongMaterial({ 
                    color: new THREE.Color( "hsl("+ col +", 100%, 50%)" ), 
                    transparent:true,
                    side: THREE.DoubleSide
                });

                var m = new THREE.Mesh( cylinderGeo, stationMaterial );
                var meshUserData = new Object();
                meshUserData.sguid = splitArray[0].replace("\"", "");
                meshUserData.sname = splitArray[1].replace("\"", "");
                meshUserData.sdirection = splitArray[2].replace("\"", "");
                meshUserData.spflow = _.drop(splitArray, 5);     
                // meshUserData.baseH = height;
                m.userData = meshUserData;

                // domEvents.addEventListener(m, 'click', function(event){
                //     var intersected = event.target;

                //     stationOD.showStationOD(intersected.userData.sguid);
                // }, false);
                 

                // var yScale = initCount / baseH * 10;  
                // if(yScale !== 0){ 
                //     m.visible = true;
                //     m.scale.setY(yScale); //initCount / baseH * 10000;
                // } else {
                //     m.visible = false;
                // }
                // m.position.set(xy[0], levelH + (yScale)/2, xy[1]); 
                 
                m.position.set(xy[0], levelH, xy[1]);    
                
                stationGroup.add( m );
                cloneGroup.add(m.clone());
                /** create cylinder ---end **/
            });
        };

        station.open( "GET", stationsFlow.shift() );
        station.send();
    };

    //dingyh
    exports.updatePassengerFlow = function(currentFrame){
        // var cylinder = stationGroup.children[0];
        // var tween = new TWEEN.Tween(cylinder.scale ).to( { y: cylinder.scale.y * 200 }, 3000 );
        // tween.start();

        var upColor = new THREE.Color( "hsl(8, 86%, 50%)" );
        var downColor = new THREE.Color( "hsl(199, 78%, 50%)" );
        

        _.each(stationGroup.children, function (ele, idx) {
            // var baseVal = parseFloat(ele.userData.spflow[0]); 
            var lastVal = currentFrame>0 ? parseFloat(ele.userData.spflow[currentFrame - 1]) : 0; 
            var newVal = parseFloat(ele.userData.spflow[currentFrame]);
            // var yScale = newVal / baseVal;
            var yScale = newVal / baseH * 10;  

            // var baseH = parseFloat(ele.userData.baseH);
            // var newH = baseH * yScale; 

            if(newVal < lastVal){
                ele.material.color = downColor;
            } else {
                ele.material.color = upColor;
            }

            if(yScale !== 0){
                ele.visible = true;
                
                var tween = new TWEEN.Tween(ele.scale).to({ y: yScale }, 1000)
                tween.start();

                var tween2 = new TWEEN.Tween(ele.position).to({ y: levelH + (yScale)/2 }, 1000)
                tween2.start();
            } else {
                var tween = new TWEEN.Tween(ele.scale).to({ y: 1 }, 1000)
                tween.start().onComplete(function(){
                    ele.position.setY(levelH);
                    ele.visible = false;
                });
            }
            
            // var tween = new TWEEN.Tween(ele.scale).to({ y: yScale }, 1000)
            // tween.start();

            // var tween2 = new TWEEN.Tween(ele.position).to({ y: 10 + newH/2 }, 1000)
            // tween2.start().onComplete(function(){
                // if(newVal < lastVal){
                //     ele.material.color = downColor;
                // } else {
                //     ele.material.color = upColor; //new THREE.Color( "hsl(60, 100%, 50%)" );
                // }
            // });
        });
    }

    exports.accumulatePassengerFlow = function(currentFrame){
        var geom = new THREE.Geometry();
        var material = new THREE.PointsMaterial({
            size: 10,
            transparent: true,
            opacity: 1,
            vertexColors: true,
            sizeAttenuation: true
            // color: new THREE.Color( "hsl(60, 100%, 50%)" )
        });
        var color = new THREE.Color( "hsl(60, 100%, 50%)" );
        
        _.each(stationGroup.children, function (ele, idx) {
            var newVal = parseFloat(ele.userData.spflow[currentFrame]);

            for(i=0; i<newVal; i++){
                var particle = new THREE.Vector3(ele.position.x, 10 * i, ele.position.z);
                geom.vertices.push(particle);
                
                geom.colors.push(color);
            }
        });

        var cloud = new THREE.Points(geom, material);
        cloud.position.setY ( 10000 );
        stationGroup.add(cloud);

        var tween = new TWEEN.Tween(cloud.position).to({ y: 0 }, 1000);
        tween.start().onComplete(function(){
            stationGroup.remove( cloud );
        });

        _.each(stationGroup.children, function (ele, idx) {
            // var baseVal = parseFloat(ele.userData.spflow[0]); 
            var accumulateVal = _.reduce(_.take(ele.userData.spflow, currentFrame+1), function(sum, n) { return sum + parseFloat(n); }, 0); 
            // var yScale = accumulateVal / baseVal;
            var yScale = accumulateVal / baseH * 2;

            // var baseH = parseFloat(ele.userData.baseH);
            // var newH = baseH * yScale;

            var tween2 = new TWEEN.Tween(ele.scale).to({ y: yScale }, 1000)
            tween2.delay(1000).start();

            var tween3 = new TWEEN.Tween(ele.position).to({ y: levelH + (yScale)/2 }, 1000)
            tween3.delay(1000).start();
        });
    }

    exports.nextTaxi = function(t){stationCurveId++; stationCurveId%=stationCurves.length; };
    exports.updateTaxiCam = function(t){

        var vertices = stationCurves[stationCurveId];

        var pos = getPositionAt(vertices, t);
        exports.stationCamera.position.x += ( pos.x - exports.stationCamera.position.x  ) * .1;
        exports.stationCamera.position.y += ( 300   - exports.stationCamera.position.y  ) * .1;
        exports.stationCamera.position.z += ( pos.y - exports.stationCamera.position.z  ) * .1;
        var xy = getPositionAt(vertices, t+0.0001);
        tg.x += ( xy.x  - tg.x ) * .95;
        tg.y += ( 25     - tg.y ) * .95;
        tg.z += ( xy.y  - tg.z ) * .95;
        exports.stationCamera.lookAt( tg );

    };

    var start = Date.now();
    exports.update = function(){
        var t = ( Date.now() - start )  * 0.001;
        stationMaterials.forEach(function( m, i ){
            m.opacity = ( .5 + Math.sin( t + Math.PI * 2 * stationTime[i] ) * .5 ) * .1;
        });
    };

    exports.bright = function(){
       stationMaterials.forEach( function(m, i){

           var col  = 150 + ~~( ( ( stationMaterials.length - i ) / stationMaterials.length ) *  120 );
           m.color = new THREE.Color( "hsl("+ col +", 100%, 50%)" );
           m.blending = THREE.NormalBlending;

       }) ;
    };
    exports.dark = function(){
        stationMaterials.forEach( function(m, i){

            var col  = ~~( ( ( stationMaterials.length - i ) / stationMaterials.length ) *  60 );
            m.color = new THREE.Color( "hsl("+ col +", 100%, 50%)" );
            m.blending = THREE.AdditiveBlending;

        }) ;
    };
    return exports;

}({});