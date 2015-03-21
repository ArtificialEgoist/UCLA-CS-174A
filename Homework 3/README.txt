CS174A Homework 3 (Nathan Tung)

OS/BROWSER:
Windows 7/Firefox

INSTRUCTIONS:
Open the Code/homework3.html to automatically load Code/homework3.js and the WebGL library files in Common

WHAT WAS DONE:
All requirements (1-7)
Extra credit 1
Extra credit 2 (half working)

CONTROLS:
-"up"/"down": controls vertical rotation of the camera
-"left"/"right": controls horizontal rotation (heading/azimuth) of the camera
-"i"/"j"/"k"/"m": controls the camera by going forward, left, right, or backwards by 1 degree or 0.25 units
-"esc": reverts to the original, default navigation view
-"a": toggles attachment (or attempts to attach) to the outermost planet

REQUIREMENT DETAILS:
-Requirement 1: the canvas is displayed on the page - very straightforward
-Requirement 2: tetrahedron method from the book is used to generate spheres with a parameter to control the number of vertices
-Requirement 3: we can use the number of vertices to control complexity and use a variable to generate different normals for flat/smooth shading
-Requirement 4: the solar system in the same y-plane is designed with the sun at the center as a point light; the sun is quite large and is red
-Requirement 5: generateSphere() used to place planets into solar system with specified parameters (complexity, color, shading, specular highlight, etc.)
-Requirement 6: navigation system is same as before, with y-axis factored in; camera now shifts in y-rotation rather than in altitude on key "up"/"down"
-Requirement 7: see html file for more details in choice; we opted to use smooth, per-vertex shading as a default for an aesthetic yet efficient compromise

EXTRA CREDIT DETAILS:
-Extra Credit 1: a pink moon successfully circles the 3rd (blue) planet from the sun!
-Extra Credit 2: not completely working as intended; toggling the key "a" will cause us to orbit the sun at a position very close to the outer planet, but it doesn't actually stick to the planet