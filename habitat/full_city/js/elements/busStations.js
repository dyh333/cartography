var busStations = function( exports ){


    var renderTaxi = false;
    var stationCurveId = 2;
    var stationCurves = [];
    var stationMaterials = [];
    var stationTime = [];
    var stationGroup, stationCamera;
    var tg = new THREE.Vector3();

    var minCount = 0, maxCount = 300;
    var minCylinderH = 0, maxCylinderH = 600;

    // var stations = [
    //     '../../taxi/busstationdata/sip_bus_stations.txt'
    // ];
    var stationsFlow = [
        '../../taxi/busstationdata/sip_bus_station_flow_20161212.txt'
    ];

    exports.init = function( group, camera ){
        stationGroup = group;
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
                var height = (maxCylinderH - minCylinderH)/(maxCount-minCount)*(initCount-minCount);
                
                var cylinderGeo = new THREE.CylinderGeometry(20, 20, height);

                var stationMaterial = new THREE.MeshPhongMaterial({ 
                    color: new THREE.Color( "hsl("+ col +", 100%, 50%)" ), 
                    transparent:true,
                    side: THREE.DoubleSide
                });

                var m = new THREE.Mesh( cylinderGeo, stationMaterial );
                var meshUserData = new Object();
                meshUserData.sguid = splitArray[0];
                meshUserData.sname = splitArray[1];
                meshUserData.sdirection = splitArray[2];
                meshUserData.spflow = _.drop(splitArray, 5);
                meshUserData.baseH = height;
                m.userData = meshUserData;
                
                m.position.set(xy[0], 10 + height/2, xy[1]);

                group.add( m );
                /** create cylinder ---end **/
            });

            
            // stationCurves.push(geom.vertices );
            // stationMaterials.push(stationMaterial);
            // stationTime.push( stations.length / tot );

            // if( stations.length > 0 ){
            //     station.open( "GET", stations.shift() );
            //     station.send();
            // }else{
            //     //dingyh: 做啥用？？？
            //     stationTime.sort(function( a,b){return Math.random() < .5 ? - 1 : 1; });
            // }

            // renderTaxi = true;
        };

        station.open( "GET", stationsFlow.shift() );
        station.send();
    };

    //dingyh
    exports.updatePassengerFlow = function(hour){
        // var cylinder = stationGroup.children[0];
        // var tween = new TWEEN.Tween(cylinder.scale ).to( { y: cylinder.scale.y * 200 }, 3000 );
        // tween.start();

        var upColor = new THREE.Color( "hsl(8, 86%, 50%)" );
        var downColor = new THREE.Color( "hsl(199, 78%, 50%)" );
        

        _.each(stationGroup.children, function (ele, idx) {
            // var ele = stationGroup.children[0];

            var baseVal = parseFloat(ele.userData.spflow[0]); 
            var lastVal = parseFloat(ele.userData.spflow[hour-6-1]); 
            var newVal = parseFloat(ele.userData.spflow[hour-6]); 
            var yScale = newVal / baseVal;

            var baseH = parseFloat(ele.userData.baseH);
            var newH = baseH * yScale;
            
            var tween = new TWEEN.Tween(ele.scale).to({ y: yScale }, 1000)
            tween.start();

            var tween2 = new TWEEN.Tween(ele.position).to({ y: 10 + newH/2 }, 1000)
            tween2.start().onComplete(function(){
                if(newVal < lastVal){
                    ele.material.color = downColor;
                } else {
                    ele.material.color = upColor; //new THREE.Color( "hsl(60, 100%, 50%)" );
                }
            });
        });
    }

    exports.accumulatePassengerFlow = function(hour){
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
            var newVal = parseFloat(ele.userData.spflow[hour-6]);

            for(i=0; i<newVal; i++){
                var particle = new THREE.Vector3(ele.position.x, 10 * i, ele.position.z);
                geom.vertices.push(particle);
                
                geom.colors.push(color);
            }
        });

        var cloud = new THREE.Points(geom, material);
        cloud.position.setY ( 8000 );
        stationGroup.add(cloud);

        var tween = new TWEEN.Tween(cloud.position).to({ y: 0 }, 1000);
        tween.start().onComplete(function(){
            stationGroup.remove( cloud );
        });

        _.each(stationGroup.children, function (ele, idx) {
            var baseVal = parseFloat(ele.userData.spflow[0]); 
            var accumulateVal = _.reduce(_.take(ele.userData.spflow, hour-6+1), function(sum, n) { return sum + parseFloat(n); }, 0); 
            var yScale = accumulateVal / baseVal;

            var baseH = parseFloat(ele.userData.baseH);
            var newH = baseH * yScale;

            var tween2 = new TWEEN.Tween(ele.scale).to({ y: yScale }, 1000)
            tween2.delay(1000).start();

            var tween3 = new TWEEN.Tween(ele.position).to({ y: 10 + newH/2 }, 1000)
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