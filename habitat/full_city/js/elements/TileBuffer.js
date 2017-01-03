var TileBuffer = function() {

    //creates a single geometry from vertices buffers and edges informations ( and some extra shnizzle too )
    function TileBuffer( tile, bufferVertices, bufferEdges, material, bufferHeights, processUvs, bufferUIDs ){

        //might be useful ...
        this.tile = tile;

        var vertexCount = 0;
        bufferVertices.forEach( function(pts){ vertexCount += pts.length;});

        //vertex pool
        var vertices = new Float32Array( vertexCount * 3 * 2  );


        //uvs pool
        var uvs;
        processUvs = Boolean( processUvs );
        if( processUvs ) uvs = new Float32Array( vertexCount * 2 * 2 );

        //creates a temp buffer for indices (as we don't know yet how many there will be)
        var indicesBuffer = [];

        //get all vertices, their associated uvs and performs triangulation + extrusion
        var inc = 0, p, i;

        var vertexInc = 0;
        var uvInc = 0;
        bufferVertices.forEach( function( points, k ){

            //dingyh: 只有水系有用
            //uvs bounds
            if( processUvs ){
                var uvbounds =  new THREE.Vector4(0,0,1,1);

                //get uv min / max
                var min = new THREE.Vector2( Math.POSITIVE_INFINITY, Math.POSITIVE_INFINITY );
                var max = new THREE.Vector2( Math.NEGATIVE_INFINITY, Math.NEGATIVE_INFINITY );
            }

            //create vertx pool
            for ( i = 0; i < points.length * 2; i++ ) {

                //stores 2 versions of each point: the ground and the roof
                p = points[ i % points.length ];
                vertices[vertexInc++] = p[0];
                vertices[vertexInc++] = i >= points.length ? bufferHeights[ k ] : 0;//uses the extrusion height
                vertices[vertexInc++] = p[1];

                //dingyh: 只有水系有用
                //check uv min / max
                if( processUvs ){
                    min.x = Math.min( p[0], min.x );
                    min.y = Math.min( p[1], min.y );
                    max.x = Math.max( p[0], max.x );
                    max.y = Math.max( p[1], max.y );
                }
            }

            //dingyh: 只有水系有用
            //map uvs to uvBounds
            if( processUvs ){
                for( i = 0; i < points.length * 2; i++){
                    //dingyh 没看懂
                    p = points[ i % points.length ];
                    uvs[ uvInc++ ] = uvbounds.x + ( ( p[0] - min.x ) / ( max.x - min.x ) ) * uvbounds.z;
                    uvs[ uvInc++ ] = uvbounds.y + ( ( p[1] - min.y ) / ( max.y - min.y ) ) * uvbounds.w;
                }
            }

            //retrieves edges corresponding to this vertices set
            var edges = bufferEdges[k];



            //tesselation: top
            var result = cdt2d( points, edges, {exterior: false} );

            var capIndices = new Uint32Array( result.length * 3 );
            var indicesInc = 0;
            for ( i = 0; i < result.length; i++) {
                capIndices[indicesInc++] = result[i][ 0 ] + points.length;
                capIndices[indicesInc++] = result[i][ 1 ] + points.length;
                capIndices[indicesInc++] = result[i][ 2 ] + points.length;
            }
            capIndices.reverse();

            //tesselation: sides ( extrusion )
            var sideIndices = new Uint32Array( points.length * 3 * 2 );
            var sides = points.length;
            var step = 0, back, j, i0, i1, i2, i3;
            indicesInc = 0;
            for ( i = 0; i < 2; i++ ){

                //create faces
                if ( step > 0 ){

                    back = step - sides;
                    for ( j = 0; j < sides; j++ ){

                        i0 = back + j;
                        i1 = back + ( j + 1 ) % sides;
                        i2 = step + j;
                        i3 = step + ( j + 1 ) % sides;

                        sideIndices[indicesInc++] = i1;
                        sideIndices[indicesInc++] = i0;
                        sideIndices[indicesInc++] = i2;

                        sideIndices[indicesInc++] = i1;
                        sideIndices[indicesInc++] = i2;
                        sideIndices[indicesInc++] = i3;

                    }
                }
                step += sides;
            }

            //merging faces indices, then we'll need to concatenate them
            var indices = new Uint32Array( sideIndices.length + capIndices.length );
            indices.set( sideIndices );
            indices.set( capIndices, sideIndices.length );

            indicesBuffer.push( indices );

        } );

        //merges all indices buffers into one
        var indicesCount = 0;
        indicesBuffer.forEach( function( ind ){ indicesCount += ind.length; });

        //final indices buffer
        var indices = new Uint32Array( indicesCount );
        var indicesOffset = 0, inc = 0;
        indicesBuffer.forEach( function( ind, i ){

            //the indices offset is the length of the previous vertexbuffer * height 'slices' count ( default 2 for linear extrusion )
            if( i > 0 ) indicesOffset += bufferVertices[ ( i - 1 )].length * 2;

            //recursively adds all the faces' indices
            for( var j = 0; j < ind.length; j++){
                indices[inc++] = indicesOffset + ind[ j ];
            }

        });

        //normals
        var a  = new THREE.Vector3();
        var b  = new THREE.Vector3();
        var c  = new THREE.Vector3();
        var ab = new THREE.Vector3();
        var ac = new THREE.Vector3();
        var no = new THREE.Vector3();
        var normals = new Float32Array( indices.length );
        inc = 0;
        for( i = 0; i< indices.length; i+= 3){

            a.x = vertices[ indices[i] * 3];
            a.y = vertices[ indices[i] * 3 + 1 ];
            a.z = vertices[ indices[i] * 3 + 2 ];

            b.x = vertices[ indices[i + 1 ] * 3];
            b.y = vertices[ indices[i + 1 ] * 3 + 1 ];
            b.z = vertices[ indices[i + 1 ] * 3 + 2 ];

            c.x = vertices[ indices[i + 2 ] * 3];
            c.y = vertices[ indices[i + 2 ] * 3 + 1 ];
            c.z = vertices[ indices[i + 2 ] * 3 + 2 ];

            ab.x = b.x- a.x;
            ab.y = b.y- a.y;
            ab.z = b.z- a.z;

            ac.x = c.x- a.x;
            ac.y = c.y- a.y;
            ac.z = c.z- a.z;

            no = ab.cross( ac ).normalize();
            normals[inc++] = no.x;
            normals[inc++] = no.y;
            normals[inc++] = no.z;

        }

        //build geometry
        var geom = new THREE.BufferGeometry();
        geom.setIndex( new THREE.BufferAttribute( indices, 1 ) );
        geom.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        geom.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
        if( processUvs ){
            console.log( "processUvs" );
            geom.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
        }
        THREE.Mesh.call( this, geom, material );

    }

    var _p = TileBuffer.prototype = Object.create( THREE.Mesh.prototype );
    _p.constructor = TileBuffer;
    return TileBuffer;
}();
