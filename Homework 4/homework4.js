/*
 * @author: Nathan Tung
 * @comments: All required tasks AND extra credit tasks have been completed!
 *		Look at the README file for a quick overview of the controls.
 *		Please see comments for details. Completed tasks are labeled like (REQUIREMENT #) or (EXTRA CREDIT #) throughout comments.
 */

// global components
var canvas;
var gl;
var length = 0.5;
var time = 0.0;
var timer = new Timer();
var rotate60RPM = 0;
var rotate30RPM = 0;

// navigation system variables
var x = 0; // x-axis displacement from origin (controls right/left)
var y = 0; // y-axis displacement from origin (controls up/down)
var z = 0; // z-axis displacemeant from origin (controls back/forward)

// buffers for vertices and normals
var positionBuffer;
var normalBuffer;
var uvBuffer;
var uvBuffer2;

// view transformation matrices
var uniform_mvpMatrix;
var viewMatrix;
var projectionMatrix;
var mvpMatrix;

// light position and attribute data
var attribute_position;
var attribute_normal;
var uniform_lightPosition;
var uniform_shininess;
var uniform_sampler;
var uniform_enableShading;

var shininess = 50;
var lightPosition = vec3(0.0, 0.0, 0.0);
var enableShading = false;

// cube arrays
var pointsArray = [];
var normalsArray = [];
var uvArray = [];
var pointsArray2 = [];
var normalsArray2 = [];
var uvArray2 = [];
var index = 0;

// texture
var texture;
var texture2;

// view matrix
var eye = vec3(0, 1, 1.8);
var at = vec3(0, 0, 0);
var up = vec3(0, 1, 0);

// toggle variables
var rotation = false;
var scrollTexture = false;
var textureRotation = false;

window.onload = function init() {

	// initialize canvas (REQUIREMENT 1)
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// set up event listener on the keyboard for color cycling, toggling crosshair, navigating, and resetting
	document.onkeydown = function(e) {
		e = e || window.event;
		
		// user can move camera foward or back using "i" and "o" (REQUIREMENT 7)
		// furthermore, the user can move the camera left/right and up/down using arrow keys
		
		if(e.keyCode===73) { // "i" (move camera forward) (REQUIREMENT 7)
			z+=0.1;
		}
		else if(e.keyCode===79) { // "o" (move camera back) (REQUIREMENT 7)
			z-=0.1;
		}
		else if(e.keyCode===38) { // "up" (move camera up)
			y-=0.1;
		}
		else if( e.keyCode===40) { // "down" (move camera down)
			y+=0.1;
		}
		else if(e.keyCode===37) { // "left" (move camera left)
			x+=0.1;
		}
		else if(e.keyCode===39) { // "right" (move camera right)
			x-=0.1;
		}
		else if(e.keyCode===27) { // "esc" resets the camera to original position
			x=0;
			y=0;
			z=0;
		}
		else if(e.keyCode===82) { // "r" to toggle cube rotations (EXTRA CREDIT 1)
			rotation = !rotation;
		}
		else if(e.keyCode===84) { // "t" to toggle rotation of texture maps on cube faces (EXTRA CREDIT 2)
			textureRotation = !textureRotation;
		}
		else if(e.keyCode===83) { // "s" to toggle continuous scrolling of texture map (EXTRA CREDIT 3)
			scrollTexture = !scrollTexture;
		}
		else if(e.keyCode===49) { // "1" to toggle enabling of lighting and shadings
			enableShading = !enableShading;
		}
	};
	
	// set up world, specifying the viewport, enabling depth buffer, and clearing color buffer
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
	
	// use program with shaders
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	// loading a texture image into buffer for texture mapping (REQUIREMENT 2)
	// set up texture image using nearest neighbor filtering (REQUIREMENT 3, 5)
	texture = gl.createTexture();
    texture.image = new Image();
    texture.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, texture); // bind texture as current texture to use
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image); // upload texture image to GPU
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // parameters for scaling up (REQUIREMENT 5)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // parameters for scaling down (REQUIREMENT 5)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // prevent wrapped s coordinates (repeating)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // prevent wrapped t coordinates
		gl.bindTexture(gl.TEXTURE_2D, null);
    }
	texture.image.src = "./Images/baymax.png"; //texture.image.src = "./Images/brick.png";

	// loading a texture image into buffer for texture mapping (REQUIREMENT 2)
	// set up second texture image using tri-linear mipmap filtering (REQUIREMENT 4, 5)
	texture2 = gl.createTexture();
    texture2.image = new Image();
    texture2.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, texture2); // bind texture as current texture to use
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture2.image); // upload texture image to GPU		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // parameters for scaling up (REQUIREMENT 5)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // parameters for scaling down (REQUIREMENT 5)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); // repeat texture mapping
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); // repeat texture mapping
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
    }
	texture2.image.src = "./Images/baymax.png"; //texture2.image.src = "./Images/brick.png";
	
	cubeVertices = [
        vec3(  length,   length, length ), //vertex 0
        vec3(  length,  -length, length ), //vertex 1
        vec3( -length,   length, length ), //vertex 2
        vec3( -length,  -length, length ),  //vertex 3 
        vec3(  length,   length, -length ), //vertex 4
        vec3(  length,  -length, -length ), //vertex 5
        vec3( -length,   length, -length ), //vertex 6
        vec3( -length,  -length, -length )  //vertex 7   
    ];

	// load two different sets of cube buffers (REQUIREMENT 3, 4)
	// one with regular texture coordinates and the other with 0.5 coordinate change (50% zoom out)
    cube(cubeVertices, pointsArray, normalsArray, uvArray, 0);	// regular size (REQUIREMENT 3)
	cube(cubeVertices, pointsArray2, normalsArray2, uvArray2, 0.5); // zoomed out by 50% (REQUIREMENT 4)

	// bind and set up position buffer
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
	// bind and set up normal buffer
	normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
	
	// bind and set up texture coordinate buffer
	uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(uvArray), gl.STATIC_DRAW);
	
	// bind and set up texture coordinate buffer with 0.5 coordinate change (50% zoom out)
	uvBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(uvArray2), gl.STATIC_DRAW);
	
// enable bound shader position/normal attributes
	
    attribute_position = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(attribute_position);

    attribute_normal = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(attribute_normal);
	
	attribute_UV = gl.getAttribLocation(program, "vTextureCoordinates");
    gl.enableVertexAttribArray(attribute_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(attribute_position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(attribute_normal, 3, gl.FLOAT, false, 0, 0);	

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);	
	
	// set variables for all the other uniform variables in shader
    uniform_mvMatrix = gl.getUniformLocation(program, "mvMatrix");
    uniform_pMatrix = gl.getUniformLocation(program, "pMatrix");
    uniform_lightPosition = gl.getUniformLocation(program, "lightPosition");
    uniform_shininess = gl.getUniformLocation(program, "shininess");
	uniform_sampler = gl.getUniformLocation(program, "uSampler");
	uniform_enableShading = gl.getUniformLocation(program, "enableShading");
	
	// set camera position and perspective such that both cubes are in view (REQUIREMENT 6)
    viewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(90, 1, 0.001, 1000);

	// set light position
	mvLightMatrix = viewMatrix;
	uniform_mvLightMatrix = gl.getUniformLocation(program, "mvLightMatrix");
	gl.uniformMatrix4fv(uniform_mvLightMatrix, false, flatten(mvLightMatrix));
	
	// reset timer and enable depth buffer before rendering
    timer.reset();	
    gl.enable(gl.DEPTH_TEST);
	
    render();
}

function render() {
	
	// clear buffers and update time based on timer
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    time += timer.getElapsedTime() / 1000;
	
	// determine whether to apply light/shading or use only texture as color
	gl.uniform1f(uniform_enableShading, enableShading);
	
	// if rotation is true, every second our cubes should rotate once/half, respectively (EXTRA CREDIT 1)
	if(rotation) {
		rotate60RPM=time*360;
		rotate30RPM=time*180;
	}
		
	viewMatrix = lookAt(eye, at, up);

	// set projection matrix
	gl.uniformMatrix4fv(uniform_pMatrix, false, flatten(projectionMatrix));
	
	// set light position
	gl.uniform3fv(uniform_lightPosition,  flatten(lightPosition));
    gl.uniform1f(uniform_shininess,  shininess);
	
// cube 1 (REQUIREMENT 3, 5)

	// if texture rotation is true, we apply a slight rotation (at 60 RPM) on the first cube's uvArray
	// then rebind it to uvBuffer to be rendered (EXTRA CREDIT 2)
	if(textureRotation) {
		// make a copy of uvArray
		var uvArrayTemp = uvArray.slice();
		
		// apply absolute rotational positioning to copy of uvArray
		// absolute in the sense that the x and y components of uvArrayTemp are calculated anew each time, from 0 degrees to time*360 degrees
		rotateUV(uvArrayTemp, time*360);		
		
		// apply transformation via binding
		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(uvArrayTemp), gl.STATIC_DRAW);
	}

	// bind the normal texture coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);

	// set up model-view matrix and bind
	mvMatrix = viewMatrix;
	mvMatrix = mult(mvMatrix, translate(vec3(x,y,z)));
	mvMatrix = mult(mvMatrix, translate(vec3(-0.75, 0, 0)));
	mvMatrix = mult(mvMatrix, rotate(rotate60RPM, [0, 1, 0]));
	mvMatrix = mult(mvMatrix, scale(vec3(0.9, 0.9, 0.9)));
    gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));
	
	// bind to first texture (normal, nearest neighbor)
	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniform_sampler, 0)

	gl.drawArrays(gl.TRIANGLES, 0, 36);
	
// cube 2 (REQUIREMENT 4, 5)
	
	// if texture scrolling is enabled, we use translateUV to increment the x and y positions of the texture coordinates (EXTRA CREDIT 3)
	// by incrementing x and y at the same rate, we can create a diagonally-scrolling texture, then rebind uvBuffer2
	if(scrollTexture) {		
	
		// apply relative translatational positioning to uvArray2 itself
		// relative in the sense that the x and y components of uvArray2 are additively increased by 0.01 each time
		translateUV(uvArray2, 0.01, 0.01);
		
		// apply transformation via binding
		uvBuffer2 = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer2);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(uvArray2), gl.STATIC_DRAW);
	}
		
	// bind the 50% zoom out texture coordinates
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer2);
	gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0); 
	
	// set up model-view matrix and bind
	mvMatrix = viewMatrix;
	mvMatrix = mult(mvMatrix, translate(vec3(x,y,z)));
	mvMatrix = mult(mvMatrix, translate(vec3(0.75, 0, 0)));
	mvMatrix = mult(mvMatrix, rotate(rotate30RPM, [1, 0, 0]));
	mvMatrix = mult(mvMatrix, scale(vec3(0.9, 0.9, 0.9)));
    gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));
	
	// bind to second texture (no clamping, tri-linear mipmap)
	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.uniform1i(uniform_sampler, 0)
	
	gl.drawArrays(gl.TRIANGLES, 0, 36);
	
    window.requestAnimFrame(render);
}

// create a cube via arrays for points, normals, and texture coordinates 
// coordinateChange tells us whether we should change the texture image size
// by default, use 0 (use a negative to zoom in, positive to zoom out)
function cube(vertices, points, normals, uv, coordinateChange, enableScroll){
    quad(vertices, points, normals, uv, 0, 1, 2, 3, vec3(0, 0, 1), coordinateChange, enableScroll);
    quad(vertices, points, normals, uv, 4, 0, 6, 2, vec3(0, 1, 0), coordinateChange, enableScroll);
    quad(vertices, points, normals, uv, 4, 5, 0, 1, vec3(1, 0, 0), coordinateChange, enableScroll);
    quad(vertices, points, normals, uv, 2, 3, 6, 7, vec3(1, 0, 1), coordinateChange, enableScroll);
    quad(vertices, points, normals, uv, 6, 7, 4, 5, vec3(0, 1, 1), coordinateChange, enableScroll);
    quad(vertices, points, normals, uv, 1, 5, 3, 7, vec3(1, 1, 0 ), coordinateChange);
}

// produces arrays for normals, points, and texture coordinates (uv) while accounting for coordinate changes
// coordinateChange can be used to scale the texture image itself
function quad( vertices, points, normals, uv, v1, v2, v3, v4, normal, coordinateChange){

	// push normals for shading
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);

	// push T(s,t) from interval [0,1] while accounting for any changes in image size
    uv.push(vec2(0-coordinateChange,0-coordinateChange));
    uv.push(vec2(1+coordinateChange,0-coordinateChange));
    uv.push(vec2(1+coordinateChange,1+coordinateChange));
    uv.push(vec2(0-coordinateChange,0-coordinateChange));
    uv.push(vec2(1+coordinateChange,1+coordinateChange));
    uv.push(vec2(0-coordinateChange,1+coordinateChange));
	
	// push points
    points.push(vertices[v1]);
    points.push(vertices[v3]);
    points.push(vertices[v4]);
    points.push(vertices[v1]);
    points.push(vertices[v4]);
    points.push(vertices[v2]);
}

// given a 2D matrix of rows comprising vec2 of texture coordinates, transform each vec2 to be rotated by theta
function rotateUV(matrix, theta) {

	var rad = theta*Math.PI/180;

	for(var i=0; i<matrix.length; i++) {
		var tempX = matrix[i][0];
		var tempY = matrix[i][1];
		
		// texture rotates at an axis located at the corner of the cube
		// we need to translate the texture coordinates there first (a diagonal of 0.5 units, as it's a unit cube)
		tempX = tempX-0.5;
		tempY = tempY-0.5;
		
		// apply the rotation
		var newX = tempX*Math.cos(rad) + tempY*Math.sin(rad);
		var newY = -tempX*Math.sin(rad) + tempY*Math.cos(rad);
		
		// then translate texture back to original position
		newX = newX+0.5;
		newY = newY+0.5;
		
		// make changes to the matrix
		matrix[i] = [newX, newY];
	}
}

// given a 2D matrix of rows comprising vec2 of texture coordinates, transform each vec2 to be translated by distance (separated by x and y components)
function translateUV(matrix, distanceX, distanceY) {
	for(var i=0; i<matrix.length; i++) {
	
		// take x and y components of the vec2 and translate them
		var newX = matrix[i][0]+distanceX;
		var newY = matrix[i][1]+distanceY;
		
		// make changes to the matrix
		matrix[i] = [newX, newY];
	}
}