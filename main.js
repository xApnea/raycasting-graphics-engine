window.onload = main;

const pi = Math.PI;
var playerX = 300;
var playerY = 300;
var playerAngle = 0.0;
var playerDX = Math.cos(playerAngle) * 5;
var playerDY = Math.sin(playerAngle) * 5;
const mapX = 8;
const mapY = 8;


const map = [
  ['#', '#', '#', '#', '#', '#', '#', '#'],
  ['#', '.', '#', '.', '.', '.', '.', '#'],
  ['#', '.', '#', '.', '.', '.', '.', '#'],
  ['#', '.', '.', '.', '.', '.', '.', '#'],
  ['#', '.', '.', '.', '.', '.', '.', '#'],
  ['#', '.', '.', '.', '.', '#', '.', '#'],
  ['#', '.', '.', '.', '.', '.', '.', '#'],
  ['#', '#', '#', '#', '#', '#', '#', '#'],
];

document.addEventListener('keydown', function(event) {
  if(event.keyCode == 65) { //A
    playerAngle -= 0.1;
    if(playerAngle < 0) {
      playerAngle = 2 * pi;
    }
    playerDX = Math.cos(playerAngle) * 5;
    playerDY = Math.sin(playerAngle) * 5;
    main();


  }
  else if(event.keyCode == 68) { //D
    playerAngle += 0.1;
    if(playerAngle > 2 * pi) {
      playerAngle = 0;
    }
    playerDX = Math.cos(playerAngle) * 5;
    playerDY = Math.sin(playerAngle) * 5;
    main();
  }
  else if(event.keyCode == 87) { //W
    playerX += playerDX;
    playerY += playerDY;
    main();
  }
  else if(event.keyCode == 83) { //S
    playerX -= playerDX;
    playerY -= playerDY;
    main();
  }
});


function main() {
  const canvas = document.querySelector("#glCanvas");
  const gl = canvas.getContext("webgl");
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);
  // Looking up attribute locations (and uniform locations) is something you should do during initialization, not in your render loop.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
  //look up uniform locations
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  var colorUniformLocation = gl.getUniformLocation(program, "u_color");

  // make a buffer
  var positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // this converts our clipspace coordinates of -1 to +1 into the right screen size
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

  // set the resolution
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  drawMap(gl);
  drawPlayer(gl);



  ///////////////////////////////////////////////////////////////////////////
  // RENDERING FUNCTIONS
  ///////////////////////////////////////////////////////////////////////////
  function draw(gl) {
    //Draw it
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6; //darw 3 vertices
    gl.drawArrays(primitiveType, offset, count);
  }

  function drawPlayer(gl) {
    var size = 1;          // 2 components per iteration
    gl.vertexAttribPointer(positionAttributeLocation, size, gl.FLOAT, false, 0, 0);

    setPoint(gl, playerX, playerY);
    // Set a random color.
    gl.uniform4f(colorUniformLocation, 1, 0, 0, 1);
    gl.drawArrays(gl.POINTS, 0, 2);
    //draw(gl);

    console.log(playerX+playerDX*5);
    console.log(playerY+playerDY*5);
    console.log(playerAngle);

    var size = 2;          // 2 components per iteration
    gl.vertexAttribPointer(positionAttributeLocation, size, gl.FLOAT, false, 0, 0);



    //Draw the line of sight
    setLine(gl, playerX, playerY, playerX+playerDX*5, playerY+playerDY*5)

    gl.uniform4f(colorUniformLocation, 1, 0, 0, 1);

    gl.drawArrays(gl.LINES, 0, 2);
  }

  function drawMap(gl) {
    for (var x = 0; x < mapX; x++) {
      for (var y = 0; y < mapY; y++) {
        setRectangle(gl, x * 40 + 100, y * 40 + 100, 39, 39);
        if (map[x][y] === '#') {
          gl.uniform4f(colorUniformLocation, 1, 1, 1, 1);
        } else {
          gl.uniform4f(colorUniformLocation, 0, 0, 0, .5);
        }
        draw(gl);
      }
    }
  }

  function drawRays() {
    var ray, mx, my, mp, depthOfField = 0; //int
    var rx, ry, ra, xo, yo = 0.0; //float

    for (ray = 0; ray < 1; ray++) {
      var aTan = -1/Math.tan(ra);
      if(ra > pi) {} //looking down
    }
  }

  function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ]), gl.STATIC_DRAW);
  }

  function setLine(gl, x1, y1, x2, y2) {
    // x2 += 1;
    // y2 += 1;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        // x2, y1,
        // x1, y2,
        // x1, y2,
        // x2, y1,
        x2, y2,
    ]), gl.STATIC_DRAW);
  }

  function setPoint(gl, x1, y1) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        // x2, y1,
        // x1, y2,
        // x1, y2,
        // x2, y1,
        // x2, y2,
    ]), gl.STATIC_DRAW);
  }
}
