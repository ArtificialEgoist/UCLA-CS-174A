/*
 * @author: Nathan Tung
 * @comments: All required and extra credit tasks have been completed! Please see comments for details.
 * 		Completed tasks are labeled like (REQUIREMENT 4) throughout comments.
 */

// global variables
var canvas;
var gl;
var dis = 0.0;
var deg = 0.0;
var displacement;
var modelViewMatrix;
var program; // main program using main shaders
var usingProgram; // true if sierpinski gasket is active and the alternate is not
var numPoints; // number of points to use for sierpinski gasket
// primitives buffers
var primitivesBuffer;
var primitivesColorBuffer;
//sierpinski gasket buffers
var sierpinskiBuffer;
var sierpinskiColorBuffer;
// other sierpinski fractal buffers
var sierpinskiGasketVertices;
var sierpinskiAlternateVertices;

window.onload = function init() {
	
	// create and set up canvas at id "gl-canvas"(REQUIREMENT 1)
	canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);	
	if(!gl) {
		// if WebGL is unsupported, display alert error meessage
		alert("WebGL is not available!");
	}
	
	// set up event listener on the keyboard's 1-4 and "r" keys
	// numbers 1 to 4 adjust the fragment shader color of primitives
	// number 5 toggles between sierpinski gasket and the alternate fractal
	// r causes the the fractal to rotate (directional swivel)
	document.onkeydown = function(e) {
		e = e || window.event;
		if(e.keyCode===49) {
			//"1" key (default color) sets current color of all primitives to r-g-b-black balanced (EXTRA CREDIT 2)
			// bind to color buffer, then update its data
			var colors1 = [ vec4(1, 0, 0, 1),  vec4(0, 1, 0, 1), vec4(0, 0, 1, 1), vec4(0, 0, 0, 1) ];
			gl.bindBuffer(gl.ARRAY_BUFFER, primitivesColorBuffer); 
			gl.bufferData(gl.ARRAY_BUFFER, flatten(colors1), gl.STATIC_DRAW);
		}
		else if(e.keyCode===50) {
			//"2" key sets current color of all primitives to red-black dominant
			var colors2 = [ vec4(1, 0, 0, 1), vec4(0, 0, 0, 1), vec4(0, 0, 0, 1), vec4(0, 0, 0, 1) ];
			gl.bindBuffer(gl.ARRAY_BUFFER, primitivesColorBuffer); 
			gl.bufferData(gl.ARRAY_BUFFER, flatten(colors2), gl.STATIC_DRAW); 
		}
		else if(e.keyCode===51) {
			//"3" key sets current color of all primitives to green-black dominant
			var colors3 = [ vec4(0, 0, 0, 1), vec4(0, 1, 0, 1), vec4(0, 0, 0, 1), vec4(0, 0, 0, 1) ];
			gl.bindBuffer(gl.ARRAY_BUFFER, primitivesColorBuffer); 
			gl.bufferData(gl.ARRAY_BUFFER, flatten(colors3), gl.STATIC_DRAW); 
		}
		else if(e.keyCode===52) { 
			//"4" key sets current color of all primitives to blue-black dominant
			var colors4 = [ vec4(0, 0, 0, 1), vec4(0, 0, 0, 1), vec4(0, 0, 1, 1), vec4(0, 0, 0, 1) ];
			gl.bindBuffer(gl.ARRAY_BUFFER, primitivesColorBuffer); 
			gl.bufferData(gl.ARRAY_BUFFER, flatten(colors4), gl.STATIC_DRAW); 
		}
		else if(e.keyCode===82) //"r" key increments the degree of all positions by 10 (EXTRA CREDIT 4)
			deg+=10;
		else if(e.keyCode===53) {
			//"5" key toggles between showing and hiding sierpinski gasket and the alternate fractal (EXTRA CREDIT 3)
			if(usingProgram) {
				gl.bindBuffer(gl.ARRAY_BUFFER, sierpinskiBuffer); // bind buffer to be used by gl
				gl.bufferData(gl.ARRAY_BUFFER, flatten(sierpinskiAlternateVertices), gl.STATIC_DRAW); // bind flattened data from color array to gl buffer data
			}
			else {
				gl.bindBuffer(gl.ARRAY_BUFFER, sierpinskiBuffer); // bind buffer to be used by gl
				gl.bufferData(gl.ARRAY_BUFFER, flatten(sierpinskiGasketVertices), gl.STATIC_DRAW); // bind flattened data from color array to gl buffer data
			}
			usingProgram = !usingProgram;
		}
	};
	
	// set canvas background to a light gray color when cleared
	gl.clearColor(0.95, 0.95, 0.95, 1.0);
	
	//  load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader"); // initialize vertex/fragment shaders as program
    gl.useProgram(program);
	usingProgram = true; // program is now active	
	
// BEGIN: PRIMITIVES (REQUIREMENT 2)
	
	// vertices used for primitives
	var vertices2 = [
		vec2(1/2, 1/2),
		vec2(1/2, -1/2),
		vec2(-1/2, -1/2),
		vec2(0, -1)
	];
	
	// create primitives buffer for holding vertices, bind to it, then insert data to load into GPU
	primitivesBuffer = gl.createBuffer(); // create a new buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, primitivesBuffer); // bind buffer to be used by gl
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices2), gl.STATIC_DRAW); // bind flattened data from vertices array to gl buffer data
	
	// set color variables to pass into fragment shader (EXTRA CREDIT 1)
	var colors = [
        vec4(1, 0, 0, 1),
        vec4(0, 1, 0, 1),
        vec4(0, 0, 1, 1),
        vec4(0, 0, 0, 1)
    ];
	
	// create primitives buffer for holding colors, bind to it, then insert data to load into GPU
    primitivesColorBuffer = gl.createBuffer(); // create a new buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, primitivesColorBuffer); // bind buffer to be used by gl
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW); // bind flattened data from color array to gl buffer data
	
	// associate shader variables with vertices data buffer
	gl.vertexAttribPointer(gl.getAttribLocation(program, "vPosition"), 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(gl.getAttribLocation(program, "vPosition"));
	
	// associate shader variables with color data buffer
    gl.vertexAttribPointer(gl.getAttribLocation(program, "vColor"), 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.getAttribLocation(program, "vColor"));
	
// END: PRIMITIVES
	
// BEGIN: SIERPINSKI GASKET (REQUIREMENT 3)
	
	// run the sierpinski gasket algorithm to determine vertices
	numPoints = 5000;
	var sierpinskiGasketVertices = sierpinski_gasket(numPoints);	
	
	// create sierpinski buffer for holding vertices, bind to it, then insert data to load into GPU
	sierpinskiBuffer = gl.createBuffer(); // create a new buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, sierpinskiBuffer); // bind buffer to be used by gl
	gl.bufferData(gl.ARRAY_BUFFER, flatten(sierpinskiGasketVertices), gl.STATIC_DRAW); // bind flattened data from vertices array to gl buffer data
	
	// create sierpinski buffer for holding colors, bind to it, then insert data to load into GPU
	// create colors vector to set each point of numPoints to be black
	var colors = [];
	for(var i=0; i<numPoints; i++) {
		colors = colors.concat([0.0, 0.0, 0.0, 1.0]);
	}
    sierpinskiColorBuffer = gl.createBuffer(); // create a new buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, sierpinskiColorBuffer); // bind buffer to be used by gl
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW); // bind flattened data from color array to gl buffer data

// END: SIERPINSKI GASKET

// BEGIN: SIERPINSKI ALTERNATE (EXTRA CREDIT 3)
	
	// run the sierpinski alternate algorithm to determine vertices
	sierpinskiAlternateVertices = sierpinski_alternate(numPoints);	
	
	// instead of creating a separate buffer for it, we can replace the sierpinski gasket buffer's data with this data on keyboard event
	
	/*
	// create sierpinski buffer for holding vertices, bind to it, then insert data to load into GPU
	sierpinskiOtherBuffer = gl.createBuffer(); // create a new buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, sierpinskiOtherBuffer); // bind buffer to be used by gl
	gl.bufferData(gl.ARRAY_BUFFER, flatten(sierpinskiAlternateVertices), gl.STATIC_DRAW); // bind flattened data from vertices array to gl buffer data
	
	// create sierpinski buffer for holding colors, bind to it, then insert data to load into GPU
	// create colors vector to set each point of numPoints to be black
	var colors = [];
	for(var i=0; i<numPoints; i++) {
		colors = colors.concat([0.0, 0.0, 0.0, 1.0]);
	}
    sierpinskiOtherColorBuffer = gl.createBuffer(); // create a new buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, sierpinskiOtherColorBuffer); // bind buffer to be used by gl
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW); // bind flattened data from color array to gl buffer data
	*/
	
// END: SIERPINSKI ALTERNATE
	
	// determine positioning
	displacement = gl.getUniformLocation(program, "displacement");
    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
		
	// finally, render image by clearing the canvas to specified color and drawing arrays
	render();
};

function render() {

	// clear canvas to default clear color
	gl.clear(gl.COLOR_BUFFER_BIT);
	
// RENDER PRIMITIVES (REQUIREMENT 2)	
	
	// change focus (bind) of position/color to primitives
	gl.bindBuffer(gl.ARRAY_BUFFER, primitivesBuffer);
	gl.vertexAttribPointer(gl.getAttribLocation(program, "vPosition"), 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, primitivesColorBuffer);
	gl.vertexAttribPointer(gl.getAttribLocation(program, "vColor"), 4, gl.FLOAT, false, 0, 0);
	
	// draw primitives using the primitives buffer; uncomment for more examples
	//gl.drawArrays(gl.LINES, 0, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	//gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	//gl.drawArrays(gl.POINTS, 0, 2);
	//gl.drawArrays(gl.LINE_STRIP, 0, 4);
	//gl.drawArrays(gl.LINE_LOOP, 0, 4);

// RENDER SIERPINSKI GASKET (REQUIREMENT 3)

	// change focus (bind) of position/color to sierpinski gasket
	gl.bindBuffer(gl.ARRAY_BUFFER, sierpinskiBuffer);
	gl.vertexAttribPointer(gl.getAttribLocation(program, "vPosition"), 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, sierpinskiColorBuffer);
	gl.vertexAttribPointer(gl.getAttribLocation(program, "vColor"), 4, gl.FLOAT, false, 0, 0);
	
	// draw all numPoints amount of sierpinski points
	gl.drawArrays(gl.POINTS, 0, numPoints);
	
	// set vertex shader's positioning, allowing for rotation (EXTRA CREDIT 4)
	var ctm = rotate(deg, 0, 1, 0);
	gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
    window.requestAnimFrame(render);
}

// given a parameter numPoints, sierpinski_gasket() returns an array of numPoints amount of points
function sierpinski_gasket(numPoints) {

	// set up initial seed points
	var vertices2 = [
		vec2(-0.5, -0.5),
		vec2(0.5, -0.5),
		vec2(0.0, 0.5)
	];
	
	// find halfway mark between the seed points
	var u = add(vertices2[0], vertices2[1]);
	var v = add(vertices2[0], vertices2[2]);
	var p = scale(0.5, add(u, v));
	points = [ p ];
	
	// calculate new random points and push into points array
	for(var i=0; points.length<numPoints; ++i) {
		var j = Math.floor(Math.random()*3);
		p = add(points[i], vertices2[j]);
		p = scale(0.5, p);
		points.push(p);
	}
	
	// return the entire points array
	return points;
}

// sierpinski_alternate() returns an array of points based off of sierpinski_gasket(), but with an alternate scale (EXTRA CREDIT 3)
function sierpinski_alternate(numPoints) {

	// set up initial seed points
	var vertices2 = [
		vec2(-0.5, -0.5),
		vec2(0.5, -0.5),
		vec2(0.5, 0.5),
		vec2(-0.5, 0.5)
	];
	
	// find fractional mark between the seed points
	var u = add(vertices2[0], vertices2[1]);
	var v = add(vertices2[0], vertices2[2]);
	var p = scale(4/9, add(u, v));
	points = [ p ];
	
	// calculate new random points and push into points array
	for(var i=0; points.length<numPoints; ++i) {
		var j = Math.floor(Math.random()*3);
		p = add(points[i], vertices2[j]);
		p = scale(4/9, p);
		points.push(p);
	}
	
	// return the entire points array
	return points;
}
