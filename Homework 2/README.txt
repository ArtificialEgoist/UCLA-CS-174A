CS174A Homework 2 (Nathan Tung)

OS/BROWSER:
Windows 7/Firefox

INSTRUCTIONS:
Open the Code/homework2.html to automatically load Code/ homework2.js and the WebGL library file in Common

WHAT WAS DONE:
All requirements (1-6)
All extra credit (1-3)

CONTROLS:
-"c": cycles through cube colors; also toggles the orthographic projection of a crosshair
-"up"/"down": controls altitude (along y-axis) of the camera
-"left"/"right": controls the heading/azimuth of the camera
-"i"/"j"/"k"/"m": controls the camera by going forward, left, right, or backwards by 1 degree or 0.25 units
-"esc": reverts to the original, default navigation view
-"n"/"w": narrows or widens the horizontal field of view by altering aspect ratio

REQUIREMENT DETAILS:
-Requirement 1: the canvas is displayed on the page - very straightforward.
-Requirement 2: shader codes are set up in homework2.html and associated with our program in homework2.js.
-Requirement 3: 8 cubes are drawn, each with a different color which can be cycled by clicking "c," and scaled/translated to the corners.
-Requirement 4: camera can be moved using the arrow keys and i, j, k, and m keys. The objects in the world are moving, rather than using the lookAt function.
-Requirement 5: clicking "c" also toggles the orthographic projection of a cross hair; n and w keys control the aspect ratio, and thereby the horizontal field of view.
-Requirement 6: code comments are self-documenting.

EXTRA CREDIT DETAILS:
-Extra Credit 1: all cubes are instance-transformed from the same data and from a single triangle strip.
-Extra Credit 2: cubes are scaled between 2.96 and 3.03 (less than 10% variation) and rotate at a constant as specified by an array.
-Extra Credit 3: the navigation system already uses quaternions by default.