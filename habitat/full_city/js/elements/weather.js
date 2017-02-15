var weather = function( exports ){
    var particleGroup;
    var snowEmitter, rainEmitter;

    var textureLoader = new THREE.TextureLoader();

    exports.init = function( scene, xy ){
        particleGroup = new SPE.Group({
            texture: {
                // value: loadTexture('./img/snowflake.png')
                value: loadTexture('./img/raindrop2.png')
            }
        });

        particleGroup.material.needsUpdate = true;

        snowEmitter = new SPE.Emitter({
            maxAge: {
                value: 16
            },
            position: {
                value: new THREE.Vector3(0, 10000, 0),
                spread: new THREE.Vector3( 20000, 0, 15000 )
            },

            acceleration: {
                value: new THREE.Vector3(0, -0.001, 0)
            },

            velocity: {
                value: new THREE.Vector3(0, -0.001, 0),
                spread: new THREE.Vector3(1000, 2000, 1000)
            },

            color: {
                value: [ new THREE.Color('white'), new THREE.Color('white') ]
            },

            size: {
                value: [ 50*2, 100*2 ],
                spread: [ 50*2, 100*2 ]
            },

            particleCount: 1000
        });

        rainEmitter = new SPE.Emitter({
            maxAge: {
                value: 16
            },
            position: {
                value: new THREE.Vector3(0, 10000, 0),
                spread: new THREE.Vector3( 20000, 0, 15000 )
            },

            acceleration: {
                value: new THREE.Vector3(0, -30, 0)
            },

            velocity: {
                value: new THREE.Vector3(0, -30, 0),
                spread: new THREE.Vector3(200, 2000, 200)
            },

            color: {
                value: [ new THREE.Color('white'), new THREE.Color('blue') ]
                // value: new THREE.Vector3(0.66, 1.0, 0.9)
            },

            size: {
                value: [ 50*2, 100*2 ],
                spread: [ 50*2, 100*2 ]
            },

            particleCount: 2000
        });
        
        // particleGroup.addEmitter( rainEmitter );

        particleGroup.mesh.position.set(xy[0], 1000, xy[1]);
        // particleGroup.mesh.position.copy( position );

        return particleGroup;

        // console.log(particleGroup.mesh);
    };

    exports.start = function(type){
        switch(type){
            case 'snow':
                particleGroup.texture = loadTexture('./img/snowflake.png');
                particleGroup.uniforms.texture.value = particleGroup.texture;
                particleGroup.addEmitter( snowEmitter );
                break;
            case 'rain':
                particleGroup.texture = loadTexture('./img/raindrop2.png');
                particleGroup.uniforms.texture.value = particleGroup.texture;
                particleGroup.addEmitter( rainEmitter );
                break;
        }
        
    }

    exports.stop = function(type){
        switch(type){
            case 'snow':
                particleGroup.removeEmitter( snowEmitter );
                break;
            case 'rain':
                particleGroup.removeEmitter( rainEmitter );
                break;
        }
    }

    exports.update = function(delta){
        if(particleGroup !== undefined){
            particleGroup.tick( delta );
        }
		
    };

    function loadTexture(textureImg){
        return textureLoader.load( textureImg );
    }

    
    return exports;

}({});