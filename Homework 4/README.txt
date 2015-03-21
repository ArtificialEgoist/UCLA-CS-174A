CS174A Homework 4 (Nathan Tung)

OS/BROWSER:
Windows 7/Firefox

INSTRUCTIONS:
Open the homework4.html to automatically load homework4.js, the texture images, and the WebGL library files in Common.
(The "first" cube from #3 is on the left. The "second" cube from #4 is on the right.)

WHAT WAS DONE:
All requirements (1-7)
All extra credits (1-3)

CONTROLS:
-"up"/"down": controls vertical position (altitude) of the camera
-"left"/"right": controls horizontal position of the camera
-"i"/"o": controls the camera by going forward/backwards, respectively
-"esc": reverts to the original, default navigation view
-"r": toggles rotation of the two cubes using the timer to achieve 60 RPM and 30 RPM
-"t": toggles rotation of the texture on the first cube at a rate of 60 RPM; rotates around the center of the cube's texture image
-"s": toggles continuous diagonal scrolling of the texture map on the second cube
-"1": toggles lighting and shading; since it's not required, I didn't verify that the lighting variables produce accurate shadows

REQUIREMENT DETAILS:
-Requirement 1: the canvas is displayed on the page - very straightforward
-Requirement 2: we use the gl.createTexture() method and image properties to load an image as a texture into the buffer; images are found in /Images folder
-Requirement 3: the left cube is given the full texture, with s and t from [0,1]; clamping is enabled
-Requirement 4: the right cube is given the 50% zoomed-out repeating texture with aspet ratio maintained; scrolling affects this cube
-Requirement 5: the right cube uses mipmapping with tri-linear filtering; the left cube uses nearest neighbor filtering
-Requirement 6: both cubes are in front of the camera, which is located at (0, 1, 1.8); the cubes are close to the origin, but moved along the x-axis
-Requirement 7: the "i" and "o", along with arrow keys, controls a simple navigation system for the camera to better see texture filtering

EXTRA CREDIT DETAILS:
-Extra Credit 1: clicking "r" will toggle cube rotation; the left cube goes 60 RPM around y-axis; the right cube goes 30 RPM around x-axis
-Extra Credit 2: clicking "t" toggles the rotation of the texture mapping at a rate of 60 RPM; rotates uvArray made by cube(), then rebinds
-Extra Credit 3: clicking "s" toggles continuous texture scrolling, diagonally (since we offset x and y texture coordinates evenly); translates uvArray2 made by cube(), then rebinds