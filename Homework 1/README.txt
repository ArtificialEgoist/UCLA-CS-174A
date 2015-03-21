CS174A Homework 1 (Nathan Tung)

OS/BROWSER:
Windows 7/Firefox

INSTRUCTIONS:
Open the homework1.html to automatically load homework1.js and the WebGL library files

WHAT WAS DONE:
All requirements (1-4)
All extra credit (1-4)

CONTROLS:
-Number keys "1" through "4" control color
-Number key "5" toggles between Sierpinski Gasket and other fractal
-Letter key "r" rotates images on the canvas

REQUIREMENT DETAILS:
-Requirement 1: the canvas is displayed on the page - very straightforward.
-Requirement 2: primitives are rendered onto the canvas, but most are commented out. The triangle_fan is used as an example.
-Requirement 3: the Sierpinski Gasket is rendered onto the canvas as well, using 5000 points (although numPoints can be altered) and the function, sierpinski_gasket().
-Requirement 4: code comments are self-documenting.

EXTRA CREDIT DETAILS:
-Extra Credit 1: color variable for the primitives is passed through fragment shader, defaulting to a gradient of red, green, blue, and black
-Extra Credit 2: to change the dominating color of the primitives, use number keys 1, 2, 3, or 4 (alternates between red-black, green-black, blue-black, and all of the above)
-Extra Credit 3: a similar fractal is created from sierpinski_alternate() by using a different scaling factor other than 1/2; use number key 5 to toggle between Sierpinski Gasket and this fractal
-Extra Credit 4: all rendered images are rotated via vertex shader along the vertical axis by pressing the r key