/*
 * @author: Nathan Tung
 * @comments: All required and extra credit tasks have been completed! Please see comments for details.
 * 		Completed tasks are labeled like (REQUIREMENT #) or (EXTRA CREDIT #) throughout comments.
 *
 *		Having clean and thorough comments itself is a requirement (REQUIREMENT 6).
 *		By default, the built-in navigation system is already using quaternions (EXTRA CREDIT 3).
 */

// global variables
var canvas;
var gl;
var program;

// buffers and data points
var color;
var points;	
var buffer;
var colorBuffer;
var vertices;
var cubeColors;
var cubeDegrees = [0, 0, 0, 0, 0, 0, 0, 0]; // set degree (rotate speed) variables for each cube

// transformations
var aspect = 1; // aspect ratio, used to affect horizontal field of view
var rotate_deg = 0; // rotational degree of camera, used to control heading/azimuth
var x = 0; // x-axis displacement from origin (controls right/left)
var y = 0; // y-axis displacement from origin (controls up/down)
var z = -25; // z-axis displacement from origin (controls back/forward)
var calculated_x = 0;
var calculated_z = 0;
var show_crosshair = false;

// perspective
var modelViewMatrix;
var projectionMatrix;
var orthoProjectionMatrix;

/*
//var viewMatrix;
var eye = vec3(0, 0, 25);
var at = vec3(0, 0, 0);
var up = vec3(0, 1, 0);
*/

window.onload = function init() {
	
	// create and set up canvas at id "gl-canvas"(REQUIREMENT 1)
	canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);	
	if(!gl) {
		// if WebGL is unsupported, display alert error meessage
		alert("WebGL is not available!");
	}
	
	// set up event listener on the keyboard for color cycling, toggling crosshair, navigating, and resetting
	document.onkeydown = function(e) {
		e = e || window.event;
		if(e.keyCode===67) { // "c" (cycle through color of cubes; toggle crosshair)
			cycleArray(cubeColors); // use the cycleArray function to alternate between cube colors (REQUIREMENT 3)
			show_crosshair = !show_crosshair; // toggle crosshair boolean (REQUIREMENT 5)
		}
		else if(e.keyCode===78)// "n" (narrow field of view) (REQUIREMENT 5)
			aspect+=0.025;
		else if(e.keyCode===87) // "w" (widen field of view) (REQUIREMENT 5)
			aspect-=0.025;
		
		/* 	
		*	For the i, j, k, m navigation controls, I attempted to allow movement relative to the rotated azimuth/heading.
		*	Since some of the trigonometric operations were rather complex, please uncomment the following commented-out code
		*	and use that instead of the xzComponents else-if statements shown below. 
		*/
		
		/*
		else if(e.keyCode===73) // "i" (move camera forward) (REQUIREMENT 4)
			z+=0.25;
		else if(e.keyCode===74) // "j" (move camera left) (REQUIREMENT 4)
			x+=0.25;
		else if(e.keyCode===75) // "k" (move camera right) (REQUIREMENT 4)
			x-=0.25;
		else if(e.keyCode===77) // "m" (move camera back) (REQUIREMENT 4)
			z-=0.25;
		*/
		
		else if(e.keyCode===73) { // "i" (move camera forward) (REQUIREMENT 4)
			xzComponents(rotate_deg, 0, 0.25);
			x-=calculated_x;
			z-=calculated_z;
		}
		else if(e.keyCode===77) { // "m" (move camera back) (REQUIREMENT 4)
			xzComponents(rotate_deg, 1, 0.25);
			x-=calculated_x;
			z-=calculated_z;
		}
		else if(e.keyCode===74) { // "j" (move camera left) (REQUIREMENT 4)
			xzComponents(rotate_deg, 2, 0.25);
			x-=calculated_x;
			z-=calculated_z;
		}
		else if(e.keyCode===75) { // "k" (move camera right) (REQUIREMENT 4)
			xzComponents(rotate_deg, 3, 0.25);
			x-=calculated_x;
			z-=calculated_z;
		}
		else if(e.keyCode===37) // "left" (rotate camera left) (REQUIREMENT 4)
			rotate_deg--;
		else if(e.keyCode===38) // "up"  (move camera up) (REQUIREMENT 4)
			y-=0.25;
		else if(e.keyCode===39) // "right" (rotate camera right) (REQUIREMENT 4)
			rotate_deg++;
		else if(e.keyCode===40) // "down"  (move camera down) (REQUIREMENT 4)
			y+=0.25;
		else if(e.keyCode===27) { // "esc"  (reset camera to default position) (REQUIREMENT 4)
			x = 0;
			y = 0;
			z = -25;
			aspect = 1;
			rotate_deg = 0;
		}
	};
	
	gl.viewport(0, 0, canvas.width, canvas.height); // set viewport
	gl.clearColor(0.0, 0.0, 0.0, 1.0); // set canvas background to white when cleared
	gl.enable(gl.DEPTH_TEST); //enable depth
	
	// vertices used for a single unit cube; length is 0.5 such that a side of the cube becomes 1
	var length = 0.5;
	
	vertices = [
		vec3(-length, -length, length),
		vec3(-length, length, length),
		vec3(length, length, length),
		vec3(length, -length, length),
		vec3(-length, -length, -length),
		vec3(-length, length, -length),
		vec3(length, length, -length),
		vec3(length, -length, -length)
	];
	
	// specify 8 different color vectors, one for each cube (REQUIREMENT 3)
	cubeColors = [
		vec4(1.0, 0.0, 0.0, 1.0),  // red
		vec4(1.0, 0.5, 0.0, 1.0),  // orange
		vec4(1.0, 1.0, 0.0, 1.0),  // yellow
		vec4(0.0, 1.0, 0.0, 1.0),  // green
		vec4(0.0, 0.0, 1.0, 1.0),  // blue
		vec4(1.0, 0.0, 1.0, 1.0),  // magenta
		vec4(1.0, 1.0, 1.0, 1.0),  // white
		vec4(0.0, 1.0, 1.0, 1.0)   // cyan
	];

	// empty points array
	// use the cube function to populate points representing the 6 faces of each cube (REQUIREMENT 3)
	points = [];
	cube(vertices, points);
	
	// load shaders and initialize attribute buffers (REQUIREMENT 2)
    program = initShaders(gl, "vertex-shader", "fragment-shader"); // initialize vertex/fragment shaders as program
    gl.useProgram(program);
	
	// create buffer for holding vertices, bind to it, then insert data to load into GPU
	buffer = gl.createBuffer(); // create a new buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer); // bind buffer to be used by gl
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW); // bind flattened data from vertices array to gl buffer data

	// associate shader variables with attribute position
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
		
	// finally, render image by clearing the canvas to specified color and drawing arrays
	render();
};

function render() {

	// set projection matrices (perspective by default, unless specified as orthogonal)
	//viewMatrix = lookAt(eye, at, up);
	projectionMatrix = perspective(90, aspect, -1, 1); // aspect affects horizontal field of view, or fovx (REQUIREMENT 5)
	orthoProjectionMatrix = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
	
	// set uniform color and transformation variables
	color = gl.getUniformLocation(program, "color");
    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
	
	// clear canvas to default clear color and depth
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// initialize the ctm matrix used for transformations of the cubes (and essentially, the world)
	var ctm = mat4();
	
	// specify 8 different degrees of rotation, one for each cube (EXTRA CREDIT 2)
	var deg = [-1, -3, 5, 7, 2, 4, 6, -8];
	
	// specify 8 different factors of scaling (<10% variation), one for each cube (EXTRA CREDIT 2)
	var cubeScales = [
		vec3(3, 3, 3),
		vec3(2.99, 2.99, 2.99),
		vec3(3.01, 3.01, 3.01),
		vec3(2.98, 2.98, 2.98),
		vec3(3.02, 3.02, 3.02),
		vec3(2.97, 2.97, 2.97),
		vec3(3.03, 3.03, 3.03),
		vec3(2.96, 2.96, 2.96)
	];
	
	// specify 8 different translation positions, one for each cube (REQUIREMENT 3)
	var positions = [
		vec3(-10, -10, -10),
		vec3(-10, -10, 10),
		vec3(-10, 10, -10),
		vec3(-10, 10, 10),
		vec3(10, -10, -10),
		vec3(10, -10, 10),
		vec3(10, 10, -10),
		vec3(10, 10, 10)
	]
	
	// draw the cubes using the drawCube function (REQUIREMENT 3)
	// for each cube, use ctm, its specified translated position, scaling factor, rotational degree on its own axis, and  color
	for(var i=0; i<8; i++) {
		drawCube(i, ctm, positions[i], cubeScales[i], [0, 1, 0], deg[i], cubeColors[i]);
	}
	
	// if crosshair is enabled, show crosshair on screen as orthographic projection (REQUIREMENT 5)
	if(show_crosshair) {
	
		// use four vertices to create a unit cross in the center of the screen
		var crosshairPoints = [
			vec2(-0.5, 0),
			vec2(0.5, 0),
			vec2(0, -0.5),
			vec2(0, 0.5)
		];
	
		// create crosshair buffer, bind it, populate it with data points, and associate draw with this buffer
		var crosshairBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, crosshairBuffer);		
		gl.bufferData(gl.ARRAY_BUFFER, flatten(crosshairPoints), gl.STATIC_DRAW);
		gl.vertexAttribPointer(gl.getAttribLocation(program, "vPosition"), 2, gl.FLOAT, false, 0, 0);
		
		// project crosshair orthographically and scale it
		ctm = mat4();
		ctm = mult(ctm, orthoProjectionMatrix);
		ctm = mult(ctm, scale(vec3(0.1, 0.1, 0.1)));
	
		// set the color to be white and apply the transformation matrix, then draw the two crossed lines
		gl.uniform4fv(color, flatten(vec4(1.0, 1.0, 1.0, 1.0)));
		gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));	
		gl.drawArrays(gl.LINES, 0, 4);
		
		// re-bind the original cube buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.vertexAttribPointer(gl.getAttribLocation(program, "vPosition"), 3, gl.FLOAT, false, 0, 0);
	}
	
	window.requestAnimFrame(render);
}

// given an array, cycle the data such that array[0] equals the previous array[1], array[1] with the previous array[2], and so on
function cycleArray(array) {
	// temporarily save first value in array
	var first = array[0]; 

	// for all values except the last index, set to the next value
	for(var i=0; i<array.length-1; i++)
		array[i] = array[i+1];

	// set last value to first temporary value
	array[array.length-1] = first;
}

// given vertices and an empty array points, we label the vertices by indices using 0 through 7
// quad returns an array of points meant for drawing a cube via TRIANGLE_STRIP
function cube(vertices, points) {
	quad(vertices, points, 0, 3, 1, 2, 4, 7, 5, 6); // using right-hand rule and TRIANGLE_STRIP
}

// given vertices and 8 labels, we populate points with the 24 vertices needed to draw a cube using a single TRIANGLE_STRIP (EXTRA CREDIT 1)
function quad(vertices, points, a, b, c, d, e, f, g, h) {
	var indices = [a, b, c, d, b, f, d, h, f, e, h, g, e, a, g, c, e, f, a, b, c, d, g, h];
	for(var i=0; i<indices.length; i++) {
		points.push(vertices[indices[i]]);
	}	
}

// given a cube index, ctm, translate vector, scale vector, rotation axis vector, rotation speed, and the cube color array
// produce a single 3D cube using a single TRIANGLE_STRIP primitive with specified attributes (REQUIREMENT 3)
function drawCube(cube_index, ctm, draw_cube_translate, draw_cube_scale, rotate_axis, rotate_speed, draw_cube_color) {
	cubeDegrees[cube_index] += rotate_speed;
	
	ctm = mat4();
    ctm = mult(ctm, projectionMatrix);
    //ctm = mult(ctm, viewMatrix);
	ctm = mult(ctm, rotate(rotate_deg, rotate_axis)); // allow external control of navigation by rotation (REQUIREMENT 4)
	ctm = mult(ctm, translate(vec3(x, y, z))); // allow external control of navigation by translation (REQUIREMENT 4)
	ctm = mult(ctm, translate(draw_cube_translate));
    ctm = mult(ctm, scale(draw_cube_scale)); // scale cubes within 10% variation (EXTRA CREDIT 2)
	ctm = mult(ctm, rotate(cubeDegrees[cube_index], rotate_axis)); // smoothly, continuously, and individually rotate cubes at constant speed (EXTRA CREDIT 2)
	
	gl.uniform4fv(color, flatten(draw_cube_color));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));	
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 24);
}

// given the angle made between the z-axis at x=y=0 (towards the negative graph of z), return x- and z-axis components forming a hypotenus of unit length
// used to translate objects and/or the world after rotating the heading/azimuth
// notice finally that x and z must be subtracted from the x, y, z cube/world coordinates, since calculated_x and calculated_z are from the viewer's perspective
	// trigonometric equations used:
	// adjacent = tan(degree)*sqrt(unit/(1+tan(degree)^2))
	// opposite = -sqrt(unit/(1+tan(degree)^2))
function xzComponents(input_degree, direction, unit) {

	// degree can be modulo-ed to less than 360 without loss of rotational data
	degree = input_degree % 360;
	
	// determine if degree is negative
	var negative = false;
	if(degree<0)
		negative = true;
	
	// make degree positive regardless of sign
	degree = Math.abs(degree);
	
	// if degree exceeds 180, find the difference from 360 and toggle the value of negative
	if(degree>180) {
		degree = 360-degree;
		negative = !negative;
	}
	if(degree<-180) {
		degree = 360+degree;
		negative = !negative;
	}
	
	// convert degree to radians for calculating the adjacent/opposite sides using tangent
	var rad = degree*Math.PI/180;
	if(negative)
		rad = -rad;
	
	var opp = Math.tan(rad)*Math.sqrt(unit/(1+Math.pow(Math.tan(rad),2))); // angle b
	var adj = Math.sqrt(unit/(1+Math.pow(Math.tan(rad),2))); // angle a

	// for degrees +/- 90 and +/- 180, return calculated component values for x and z
	// for all other values, use the adjcent and opposite triangulated side lengths to determine x and z
	if(degree===90) {		
		if(direction===0) { // forward (i)
			calculated_x = unit;
			calculated_z = 0;
		}
		else if(direction===1) { // backward (m)
			calculated_x = -unit;
			calculated_z = 0;
		}
		else if(direction===2) { // left (j)
			calculated_x = 0;
			calculated_z = -unit;
		}
		else if(direction===3) { // right (k)
			calculated_x = 0;
			calculated_z = unit;
		}
		
		// for +/- 90 degrees, if degree is actually negative, all signs need to be flipped
		if(negative) {
			calculated_x = -calculated_x;
			calculated_z = -calculated_z;
		}
	}
	else if(degree===180) {
		if(direction===0) { // forward (i)
			calculated_x = 0;
			calculated_z = unit;
		}
		else if(direction===1) { // backward (m)
			calculated_x = 0;
			calculated_z = -unit;
		}
		else if(direction===2) { // left (j)
			calculated_x = unit;
			calculated_z = 0;
		}
		else if(direction===3) { // right (k)
			calculated_x = -unit;
			calculated_z = 0;
		}
	}
	else {
		if(direction===0) { // forward (i)
			calculated_x = opp;
			calculated_z = -adj;
		}
		else if(direction===1) { // backward (m)
			calculated_x = -opp;
			calculated_z = adj;
		}
		else if(direction===2) { // left (j)
			calculated_x = -adj;
			calculated_z = -opp;
		}
		else if(direction===3) { // right (k)
			calculated_x = adj;
			calculated_z = opp;
		}
	}

	// if degree is obtuse, flip the signs of x and z components
	if(degree>90) {
		calculated_x = -calculated_x;
		calculated_z = -calculated_z;
	}
}

// for debugging purposes; tests all possible directions (0, 1, 2, 3 - or forward, backward, left, and right, respectively)
// outputs x and z components which scales to a net distance of unit, as specified by the parameter
function xzComponentsTest(angle, unit) {
	for(var i=0; i<4; i++) {
		xzComponents(angle, i, 1, calculated_x, calculated_z);
		console.log("x: " + calculated_x + ", z: " + calculated_z);
	}
}