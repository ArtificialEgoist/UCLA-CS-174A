/*
 * @author: Nathan Tung
 * @comments: All required tasks have been completed!
		Extra credit task 1 is completed. Extra credit task 2 has been attempted with some degree of success (no pun intended).
 *		Please see comments for details. Completed tasks are labeled like (REQUIREMENT #) or (EXTRA CREDIT #) throughout comments.
 *
 */

// global components
var canvas;
var gl;
var length = 0.5;
var time = 0.0;
var timer = new Timer();

// navigation system variables
var degree_xz = 0; // horizontal rotational degree of camera (used to control heading/azimuth)
var degree_y = 30; // vertical rotation degree of camera
var x = 0; // x-axis displacement from origin (controls right/left)
var y = -10; // y-axis displacement from origin (controls up/down)
var z = 0; // z-axis displacement from origin (controls back/forward)
var calculated_x = 0;
var calculated_y = 0;
var calculated_z = 0;

// buffers for vertices and normals
var positionBuffer_low;
var normalBuffer_low;
var positionBuffer_medium;
var normalBuffer_medium;
var positionBuffer_high;
var normalBuffer_high;

// view transformation matrices
var uniform_mvpMatrix;
var viewMatrix;
var projectionMatrix;
var mvpMatrix;

// light position and 
var uniform_lightPosition;
var attribute_position;
var attribute_normal;

// light products for vertex shader
var uniform_ambientProduct;
var uniform_diffuseProduct;
var uniform_specularProduct;
var uniform_shininess;

// light products for fragment shader
var uniform_ambientProduct2;
var uniform_diffuseProduct2;
var uniform_specularProduct2;
var uniform_shininess2;

// light products (0 is red-orange sun, 1 is icy-white planet, 2 is blue-green planet, 3 is clam water, 4 is brown-orange)
// product = light * material
var ambientProduct = [
	mult(vec4(0.4, 0.4, 0.4, 1.0), vec4(1.0, 0.1, 0.0, 1.0)),
	mult(vec4(0.4, 0.4, 0.4, 1.0), vec4(0.9, 0.9, 1.0, 1.0)),
	mult(vec4(0.4, 0.4, 0.4, 1.0), vec4(0.0, 0.8, 0.7, 1.0)),
	mult(vec4(0.4, 0.4, 0.4, 1.0), vec4(0.1, 0.5, 0.8, 1.0)),
	mult(vec4(0.4, 0.4, 0.4, 1.0), vec4(0.9, 0.4, 0.1, 1.0)),
	mult(vec4(0.4, 0.4, 0.4, 1.0), vec4(1.0, 0.4, 0.7, 1.0)),
];
var diffuseProduct = [
	mult(vec4(0.5, 0.5, 0.5, 1.0), vec4(1.0, 0.1, 0.0, 1.0)),
	mult(vec4(0.5, 0.5, 0.5, 1.0), vec4(0.9, 0.9, 1.0, 1.0)),
	mult(vec4(0.5, 0.5, 0.5, 1.0), vec4(0.0, 0.8, 0.7, 1.0)),
	mult(vec4(0.5, 0.5, 0.5, 1.0), vec4(0.1, 0.5, 0.8, 1.0)),
	mult(vec4(0.5, 0.5, 0.5, 1.0), vec4(0.9, 0.4, 0.1, 1.0)),
	mult(vec4(0.6, 0.6, 0.6, 1.0), vec4(1.0, 0.4, 0.7, 1.0)),
];
var specularProduct = [
	mult(vec4(0.4, 0.4, 0.4, 1.0), vec4(1.0, 0.1, 0.0, 1.0)),
	mult(vec4(0.8, 0.8, 0.8, 1.0), vec4(0.9, 0.9, 1.0, 1.0)),
	mult(vec4(0.8, 0.8, 0.8, 1.0), vec4(0.0, 0.8, 0.7, 1.0)),
	mult(vec4(0.8, 0.8, 0.8, 1.0), vec4(0.1, 0.5, 0.8, 1.0)),
	mult(vec4(0.0, 0.0, 0.0, 1.0), vec4(0.9, 0.4, 0.1, 1.0)),
	mult(vec4(0.5, 0.5, 0.5, 1.0), vec4(1.0, 0.4, 0.7, 1.0)),
];

var shininess = 50;
var lightPosition = vec3(0.0, 0.0, 0.0);
//var lightPosition = vec3(0.0, 0.0, sunPositionZ+y);

// planetary data
var sunPositionZ = -20;
var orbitSpeed = [0, 55, 45, 25, 35, 65];
var rotationSpeed = [50, 30, 40, 70, 20, 60];
var distanceFromSun = [0, 7, 10, 13, 18, 15];
var planetScale = [4, 1.3, 0.5, 1.1, 0.7, 0.3];

// sphere arrays
var pointsArray = [];
var normalsArray = [];
var index = 0;

// sphere data
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

// view matrix
var attachToPlanet = false;
var eye = vec3(0, 0, 0);
var at = vec3(0, 0, 0);
var up = vec3(0, 1, 0);

window.onload = function init() {

	// initialize canvas (REQUIREMENT 1)
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// set up event listener on the keyboard for color cycling, toggling crosshair, navigating, and resetting
	document.onkeydown = function(e) {
		e = e || window.event;
		if(e.keyCode===73 && !attachToPlanet) { // "i" (move camera forward) (REQUIREMENT 6)
			xyzComponents(degree_xz, degree_y, 0, 0.25);
			x-=calculated_x;
			y-=calculated_y;
			z-=calculated_z;
		}
		else if(e.keyCode===77 && !attachToPlanet) { // "m" (move camera back) (REQUIREMENT 6)
			xyzComponents(degree_xz, degree_y, 1, 0.25);
			x-=calculated_x;
			y-=calculated_y;
			z-=calculated_z;
		}
		else if(e.keyCode===74 && !attachToPlanet) { // "j" (move camera left) (REQUIREMENT 6)
			xyzComponents(degree_xz, degree_y, 2, 0.25);
			x-=calculated_x;
			y-=calculated_y;
			z-=calculated_z;
		}
		else if(e.keyCode===75 && !attachToPlanet) { // "k" (move camera right) (REQUIREMENT 6)
			xyzComponents(degree_xz, degree_y, 3, 0.25);
			x-=calculated_x;
			y-=calculated_y;
			z-=calculated_z;
		}
		else if(e.keyCode===37) // "left" (rotate camera left) (REQUIREMENT 6)
			degree_xz--;
		else if(e.keyCode===38) // "up"  (move camera up) (REQUIREMENT 6)
			degree_y--;
		else if(e.keyCode===39) // "right" (rotate camera right) (REQUIREMENT 6)
			degree_xz++;
		else if(e.keyCode===40) // "down"  (move camera down) (REQUIREMENT 6)
			degree_y++;
		else if(e.keyCode===27) { // "esc"  (reset camera to default position) (REQUIREMENT 6)
			x = 0;
			y = -10;
			z = 0;
			degree_xz = 0;
			degree_y = 30;
			attachToPlanet = false;
		}
		else if(e.keyCode===65) { // "a" (toggle attach camera to planet) (EXTRA CREDIT 2)
			attachToPlanet = !attachToPlanet;
		}
		//printNavigation();
	};
	
	// set up world, specifying the viewport, enabling depth buffer, and clearing color buffer
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
	
	// use program with shaders
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
	// medium-low complexity in positionBuffer_low, normalBuffer_low
	tetrahedron(va, vb, vc, vd, 2, 0, 0); // also use flat shading
	
    positionBuffer_low = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_low);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    normalBuffer_low = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer_low);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

	// medium-high complexity in positionBuffer_medium, normalBuffer_medium
	tetrahedron(va, vb, vc, vd, 3, 1, 1);

    positionBuffer_medium = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_medium);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    normalBuffer_medium = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer_medium);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
	
	// high complexity in positionBuffer_high, normalBuffer_high
	tetrahedron(va, vb, vc, vd, 4, 1, 1);

    positionBuffer_high = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_high);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    normalBuffer_high = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer_high);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
	
	// enable bound shader position/normal attributes
	
    attribute_position = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(attribute_position);

    attribute_normal = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(attribute_normal);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_low);
    gl.vertexAttribPointer(attribute_position, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer_low);
    gl.vertexAttribPointer(attribute_normal, 4, gl.FLOAT, false, 0, 0);	
	
	// set variables for running either per-vertex or per-fragment shading
	uniform_perVertex = gl.getUniformLocation(program, "perVertex");
	uniform_perFragment = gl.getUniformLocation(program, "perFragment");
	
	// choose one of the two
	gl.uniform1f(uniform_perVertex, false);
	gl.uniform1f(uniform_perFragment, true);
	
	// set variables for all the other uniform variables in shader
    uniform_mvMatrix = gl.getUniformLocation(program, "mvMatrix");
    uniform_pMatrix = gl.getUniformLocation(program, "pMatrix");
    uniform_ambientProduct = gl.getUniformLocation(program, "ambientProduct");
    uniform_diffuseProduct = gl.getUniformLocation(program, "diffuseProduct");
    uniform_specularProduct = gl.getUniformLocation(program, "specularProduct");
    uniform_lightPosition = gl.getUniformLocation(program, "lightPosition");
    uniform_shininess = gl.getUniformLocation(program, "shininess");
	uniform_ambientProduct2 = gl.getUniformLocation(program, "ambientProduct2");
    uniform_diffuseProduct2 = gl.getUniformLocation(program, "diffuseProduct2");
    uniform_specularProduct2 = gl.getUniformLocation(program, "specularProduct2");
    uniform_shininess2 = gl.getUniformLocation(program, "shininess2");
	
	// set camera position and perspective
    viewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(90, 1, 0.001, 1000);
	
	// set light position
	uniform_mvLightMatrix = gl.getUniformLocation(program, "mvLightMatrix");
	mvLightMatrix = viewMatrix;
	mvLightMatrix = mult(mvLightMatrix, rotate(degree_xz, [0, 1, 0])); // allow rotational navigation
	mvLightMatrix = mult(mvLightMatrix, rotate(degree_y, [1, 0, 0]));
	mvLightMatrix = mult(mvLightMatrix, translate(vec3(x, y, z))); // allow translational navigation
	mvLightMatrix = mult(mvLightMatrix, translate(vec3(0, 0, sunPositionZ)));
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

	// if attached to planet, transform the camera to follow a planet's orbital path
	if(attachToPlanet) {
		
		// descend back into the same plane as the planets
		degree_y=0;
		y=0;
		
		var eyeMatrix = mat4();
		eyeMatrix = mult(eyeMatrix, translate(vec3(0, 0, sunPositionZ)));
		eyeMatrix = mult(eyeMatrix, rotate(-time*orbitSpeed[4], [0, 1, 0]));
		eyeMatrix = mult(eyeMatrix, translate(vec3(0, 0, distanceFromSun[4])));
	
		eye = vec3(eyeMatrix[0][0], eyeMatrix[0][1], eyeMatrix[0][2]);
		
		at = vec3(0, 0, 0);
		up = vec3(0, 1, 0);
		viewMatrix = lookAt(eye, at, up);
	}
	else {
		// otherwise, reset the camera to default
		eye = vec3(0, 0, 0);
		at = vec3(0, 0, 0);
		up = vec3(0, 1, 0);
		viewMatrix = lookAt(eye, at, up);
	}
	
// generate planets (REQUIREMENT 4, 5)

	generatePlanet(0, 2); // sun
	
	generatePlanet(1, 0); // icy-white planet
	
	// use Gouraud shading
	setPerVertex();
	generatePlanet(2, 0); // swamp-water-green planet
	
	// use Phong shading
	setPerFragment();
	generatePlanet(3, 2); // clam-smooth water (blue) planet
	
	// use Gouraud shading
	setPerVertex();
	generatePlanet(4, 1); // mud brown-orange planet
	
// generate moon with low complexity, setting it to orbit the third blue planet (EXTRA CREDIT 1)

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_low);
	gl.vertexAttribPointer(attribute_position, 4, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer_low);
	gl.vertexAttribPointer(attribute_normal, 4, gl.FLOAT, false, 0, 0);

	gl.uniform4fv(uniform_ambientProduct, flatten(ambientProduct[5]));
    gl.uniform4fv(uniform_diffuseProduct, flatten(diffuseProduct[5]));
    gl.uniform4fv(uniform_specularProduct, flatten(specularProduct[5]));
	
	gl.uniform4fv(uniform_ambientProduct2, flatten(ambientProduct[5]));
    gl.uniform4fv(uniform_diffuseProduct2, flatten(diffuseProduct[5]));
    gl.uniform4fv(uniform_specularProduct2, flatten(specularProduct[5]));
	
	mvMatrix = viewMatrix;
	mvMatrix = mult(mvMatrix, rotate(degree_xz, [0, 1, 0])); // allow rotational navigation
	mvMatrix = mult(mvMatrix, rotate(degree_y, [1, 0, 0]));
	mvMatrix = mult(mvMatrix, translate(vec3(x, y, z))); // allow translational navigation
	mvMatrix = mult(mvMatrix, translate(vec3(0, 0, sunPositionZ)));
	mvMatrix = mult(mvMatrix, rotate(time*orbitSpeed[3], [0, 1, 0])); // follow the 3rd planet's orbit
	mvMatrix = mult(mvMatrix, translate(vec3(0, 0, distanceFromSun[3]))); // move to 3rd planet's position + original 2 unit offset
	mvMatrix = mult(mvMatrix, rotate(time*orbitSpeed[5], [0, 1, 0])); // orbit around 3rd planet
	mvMatrix = mult(mvMatrix, translate(vec3(0, 0, 2))); // move 2 units away (from 3rd planet)
	mvMatrix = mult(mvMatrix, scale(vec3(planetScale[5], planetScale[5], planetScale[5])));
	mvMatrix = mult(mvMatrix, rotate(time*rotationSpeed[5], [0, 1, 0]));
	
    gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));
    gl.uniformMatrix4fv(uniform_pMatrix, false, flatten(projectionMatrix));

	for( var i=0; i<index; i+=3) 
        gl.drawArrays(gl.TRIANGLES, i, 3);
	
	// render
    window.requestAnimFrame(render);
}

// using the specified index i and complexity, output a sphere with distance/scale/rotational speed specified in data at index i
// complexity specifies which position/normal buffer we use (more vs. less points) (REQUIREMENT 3, 4)
function generatePlanet(i, complexity) {

	// choose which buffers to use based on complexity parameter
	// complexity 2 has most points; complexity 0 has fewest points
	if(complexity===2) {
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_high);
		gl.vertexAttribPointer(attribute_position, 4, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer_high);
		gl.vertexAttribPointer(attribute_normal, 4, gl.FLOAT, false, 0, 0);
	}
	else if(complexity===1) {
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_medium);
		gl.vertexAttribPointer(attribute_position, 4, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer_medium);
		gl.vertexAttribPointer(attribute_normal, 4, gl.FLOAT, false, 0, 0);
	}
	else {
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_low);
		gl.vertexAttribPointer(attribute_position, 4, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer_low);
		gl.vertexAttribPointer(attribute_normal, 4, gl.FLOAT, false, 0, 0);
	}
	
	// set uniform variables for light
	gl.uniform3fv(uniform_lightPosition, flatten(lightPosition));
	gl.uniform4fv(uniform_ambientProduct, flatten(ambientProduct[i]));
    gl.uniform4fv(uniform_diffuseProduct, flatten(diffuseProduct[i]));
    gl.uniform4fv(uniform_specularProduct, flatten(specularProduct[i]));
    gl.uniform1f(uniform_shininess, shininess);
	gl.uniform4fv(uniform_ambientProduct2, flatten(ambientProduct[i]));
    gl.uniform4fv(uniform_diffuseProduct2, flatten(diffuseProduct[i]));
    gl.uniform4fv(uniform_specularProduct2, flatten(specularProduct[i]));
    gl.uniform1f(uniform_shininess2, shininess);
	
	// set model view matrix to bring planet into orbit
	mvMatrix = viewMatrix;
	mvMatrix = mult(mvMatrix, rotate(degree_xz, [0, 1, 0])); // allow rotational navigation
	mvMatrix = mult(mvMatrix, rotate(degree_y, [1, 0, 0]));
	mvMatrix = mult(mvMatrix, translate(vec3(x, y, z))); // allow translational navigation
	mvMatrix = mult(mvMatrix, translate(vec3(0, 0, sunPositionZ)));
	mvMatrix = mult(mvMatrix, rotate(time*orbitSpeed[i], [0, 1, 0]));
	mvMatrix = mult(mvMatrix, translate(vec3(0, 0, distanceFromSun[i])));
	mvMatrix = mult(mvMatrix, scale(vec3(planetScale[i], planetScale[i], planetScale[i])));
	mvMatrix = mult(mvMatrix, rotate(time*rotationSpeed[i], [0, 1, 0]));
	
    gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));
    gl.uniformMatrix4fv(uniform_pMatrix, false, flatten(projectionMatrix));

	for( var i=0; i<index; i+=3) 
        gl.drawArrays(gl.TRIANGLES, i, 3);
	
}

// functions for creating sphere data (REQUIREMENT 2)
// type, either 0 or 1, sets either flat shading or smooth shading (Gouraud or Phong depends on separate variable)
// invertNormal will scale the normal array by -1 if specified

function triangle(a, b, c, type, invertNormal) {

	if(type==0) { //flat shading
		var t1 = subtract(b, a);
		var t2 = subtract(c, a);
		var normal = normalize(cross(t1, t2));
		normal = vec4(normal);

		if(invertNormal) {
			normalsArray.push(scale1(-1,normal));
			normalsArray.push(scale1(-1,normal));
			normalsArray.push(scale1(-1,normal));
		}
		else {
			normalsArray.push(normal);
			normalsArray.push(normal);
			normalsArray.push(normal);
		}
	}
	else { //smooth shading
		
		if(invertNormal) {
			normalsArray.push(scale1(-1,a));
			normalsArray.push(scale1(-1,b));
			normalsArray.push(scale1(-1,c));
		}
		else {
			normalsArray.push(a);
			normalsArray.push(b);
			normalsArray.push(c);
		}
		
	}

	pointsArray.push(a);
	pointsArray.push(b);
	pointsArray.push(c);

	index += 3;
}

function divideTriangle(a, b, c, count, type, invertNormal) {
    if ( count > 0 ) {
                
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle(a, ab, ac, count-1, type, invertNormal);
        divideTriangle(ab, b, bc, count-1, type, invertNormal);
        divideTriangle(bc, c, ac, count-1, type, invertNormal);
        divideTriangle(ab, bc, ac, count-1, type, invertNormal);
    }
    else { 
        triangle(a, b, c, type, invertNormal);
    }
}

function tetrahedron(a, b, c, d, n, type, invertNormal) {
    divideTriangle(a, b, c, n, type, invertNormal);
    divideTriangle(d, c, b, n, type, invertNormal);
    divideTriangle(a, d, b, n, type, invertNormal);
    divideTriangle(a, c, d, n, type, invertNormal);
}

// use per-vertex shading
function setPerVertex() {
	gl.uniform1f(uniform_perVertex, true);
	gl.uniform1f(uniform_perFragment, false);
}

// use per-fragment shading
function setPerFragment() {
	gl.uniform1f(uniform_perVertex, false);
	gl.uniform1f(uniform_perFragment, true);
}

// navigation system (REQUIREMENT 6)

function xyzComponents(input_degree_xz, input_degree_y, direction, unit) {
	// degree can be modulo-ed to less than 360 without loss of rotational data
	var degree = input_degree_y % 360;
	
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
	
	calculated_y = unit*Math.sin(rad); // sine is odd, so sign must be flipped based on degree
	var xzUnit = Math.abs(unit*Math.cos(rad)); // cosine is even, so sign of degree doesn't matter
			
	if(direction===0) // forward (i)
		calculated_y = -calculated_y;
	else if(direction===1) // backward (m)
		calculated_y = calculated_y;
	else if(direction===2) // left (j)
		calculated_y = 0;
	else if(direction===3) // right (k)
		calculated_y = 0;
		
	xzComponents(input_degree_xz, direction, xzUnit);

}

// given the angle made between the z-axis at x=y=0 (towards the negative graph of z), return x- and z-axis components forming a hypotenus of unit length
// used to translate objects and/or the world after rotating the heading/azimuth
// notice finally that x and z must be subtracted from the x, y, z cube/world coordinates, since calculated_x and calculated_z are from the viewer's perspective
function xzComponents(input_degree, direction, unit) {

	// degree can be modulo-ed to less than 360 without loss of rotational data
	var degree = input_degree % 360;
	
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
	
	var opp = unit*Math.sin(rad);
	var adj = unit*Math.cos(rad);

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

function printNavigation() {
	console.log("xz_deg: " + degree_xz + ", y_deg: " + degree_y + ", (" + x + ", " + y + ", " + z + ")");
}