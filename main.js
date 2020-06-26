window.onload = main;

const pi = Math.PI;
const piOverTwo = (pi / 2);
const threePiOverTwo = ((3 * pi) / 2);
const degree = 0.0174533; // this is one degree in radians

var playerX = 300;
var playerY = 300;
var playerAngle = 0.0;
var playerDX = Math.cos(playerAngle) * 5;
var playerDY = Math.sin(playerAngle) * 5;
const mapX = 8;
const mapY = 8;
const mapSize = mapX * mapY;



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

  if(event.keyCode == 87) { //W
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
  drawRays(gl);



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
    setRectangle(gl, playerX, playerY, 8, 8);
    //red
    gl.uniform4f(colorUniformLocation, 1, 0, 0, 1);
    draw(gl);
    //draw(gl);

    // console.log(playerX+playerDX*5);
    // console.log(playerY+playerDY*5);
    // console.log(playerAngle);

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
        setRectangle(gl, x * 64, y * 64, 63, 63);
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
    var ray, mX, mY, mapPosition, depthOfField = 0; //int
    var rayX, rayY, rayAngle, xOffset, yOffset, distance= 0.0; //float
    rayAngle = playerAngle - degree * 30;
    if (rayAngle < 0) {rayAngle += 2 * pi;}
    if (rayAngle > 2 * pi) {rayAngle -= 2 * pi}

    for (ray = 0; ray < 60; ray++) {
      depthOfField = 0;
      var horizDistance = 1000000; //just a really high number
      var horizX = playerX;
      var horizY = playerY;
      var aTan = (-1 / Math.tan(rayAngle));

      //looking down
      if(rayAngle > pi) {
        rayY = (((playerY>>6)<<6) - 0.0001);
        rayX = (playerY - rayY) * aTan + playerX;
        yOffset = -64;
        xOffset = -yOffset * aTan;
      }

      //looking up
      else if(rayAngle < pi) {
        rayY = (((playerY>>6)<<6) + 64);
        rayX = (playerY - rayY) * aTan + playerX;
        yOffset = 64;
        xOffset = -yOffset * aTan;
      }
      if (rayAngle == 0 || rayAngle == pi) {
        console.log('At perfect horizontal angles')
        rayX += playerX;
        rayY += playerY;
        depthOfField = 8;
      }
      while (depthOfField < 8) {
        mX = (rayX>>6);
        mY = (rayY>>6);
        if (mX < 0 || mY < 0) {
          depthOfField = 8;
        }
        else if (mX < 8 && mY < 8 && map[mX][mY] === '#') {
          depthOfField = 8;
          horizX = rayX;
          horizY = rayY;
          horizDistance = getRayDistanceFromPlayer(playerX, playerY, horizX, horizY, rayAngle);
        } else {
          rayX += xOffset;
          rayY += yOffset;
          depthOfField++;
        }
      }

      // setLine(gl, playerX, playerY, rayX, rayY);
      // gl.uniform4f(colorUniformLocation, 0, 1, 0, 1);
      // gl.drawArrays(gl.LINES, 0, 2);


      // VERTICAL LINE CHECK
      depthOfField = 0;
      var vertDistance = 1000000; //just a really high number
      var vertX = playerX;
      var vertY = playerY;

      var negTan = (-Math.tan(rayAngle));

      //looking left
      if(rayAngle > piOverTwo && rayAngle < threePiOverTwo) {
        rayX = (((playerX>>6)<<6) - 0.0001);
        rayY = (playerX - rayX) * negTan + playerY;
        xOffset = -64;
        yOffset = -xOffset * negTan;
      }

      //looking right
      else if(rayAngle < piOverTwo || rayAngle > threePiOverTwo) {
        rayX = (((playerX>>6)<<6) + 64);
        rayY = (playerX - rayX) * negTan + playerY;
        xOffset = 64;
        yOffset = -xOffset * negTan;
      }

      // Check to see if perfectly vertical playerAngle
      if (rayAngle == (3*pi)/2 || rayAngle == pi/2) {
        console.log('At perfect vertical angles')
        rayX += playerX;
        rayY += playerY;
        depthOfField = 8;
      }
      while (depthOfField < 8) {
        mX = (rayX>>6);
        mY = (rayY>>6);
        if (mX < 0 || mY < 0) {
          depthOfField = 8;
        }
        else if (mX < 8 && mY < 8 && map[mX][mY] === '#') {
          depthOfField = 8;
          vertX = rayX;
          vertY = rayY;
          vertDistance = getRayDistanceFromPlayer(playerX, playerY, vertX, vertY, rayAngle);
        } else {
          rayX += xOffset;
          rayY += yOffset;
          depthOfField++;
        }
      }

      //Only draw the ray that has the shortest distance
      if (vertDistance < horizDistance) {
        rayX = vertX;
        rayY = vertY;
        distance = vertDistance; //set the distance for that ray
        gl.uniform4f(colorUniformLocation, 0, .9, 0, 1);

      }
      if (vertDistance > horizDistance) {
        rayX = horizX;
        rayY = horizY;
        distance = horizDistance; //set the distance for that ray
        gl.uniform4f(colorUniformLocation, 0, .7, 0, 1);
      }

      //the distance calculated above will be used to draw the 3d scene

      //draw the ray
      setLine(gl, playerX, playerY, rayX, rayY);
      gl.drawArrays(gl.LINES, 0, 2);

      //draw the 3D walls
      // 320 by 160 pixels

      //This fixes the fisheye effect by getting a flat surface
      var angle = playerAngle - rayAngle;
      if (angle < 0) {angle += 2 * pi;}
      if (angle > 2 * pi) {angle -= 2 * pi;}
      distance = distance * Math.cos(angle);

      var rectangleHeight = (mapSize * 320) / distance;
      if (rectangleHeight > 320) { //cap the height at the screen height
        rectangleHeight = 320;
      }

      var rectangleOffset = 160-rectangleHeight/2;

      setRectangle(gl, ray * 8 + 530, rectangleOffset, 8, rectangleHeight)
      draw(gl);

      // the next ray will be cast one degree over, set new limits for the angle
      rayAngle += degree;
      if (rayAngle < 0) {rayAngle += 2 * pi;}
      if (rayAngle > 2 * pi) {rayAngle -= 2 * pi}

    }
  }

  function getRayDistanceFromPlayer(playerX, playerY, rayX, rayY, angle) {
    //Use the pythagorean theorum to find the hypotenuse
    const hypotenuse = Math.sqrt((rayX - playerX) * (rayX - playerX) + (playerY - rayY) * (playerY - rayY));
    return hypotenuse;
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
    // x1 += 3;
    // y1 += 3;
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
