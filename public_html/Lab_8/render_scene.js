//Anna and Sophia (split screen, dot, textures, etc)

var canvas;       // HTML 5 canvas
var gl;           // webgl graphics context
var vPosition;    // shader variable attrib location for vertices 
var vColor;       // shader variable attrib location for color
var uColor;       // shader uniform variable location for color
var uProjection;  //  shader uniform variable for projection matrix
var uModel_view;  //  shader uniform variable for model-view matrix
var vNormal;      //shader variable for vertex normals
var vTexture;     //the thing for the texture coordinates
var uTexture;

var thetaX = 0;


var camera = new Camera(); 
var stack = new MatrixStack();
var light1 = new Lighting(); //rotating lighting

/*
var light2 = new Lighting(); //lighting to light sky
var light3 = new Lighting();
var light4 = new Lighting();
var light5 = new Lighting();
*/
var program;


//textures
var checkerboard;
var target;
var noManPardon;
var mission;
var static; 
var clouds;
var roof;
var wood;
var log; 
var door;
var stone;
var fire;
var skyline;

//variables for navigation
var frac;
var scaleXG;
var scaleYG;
var scaleZG;
var totalX;
var totalZ;
var dotLocation; 
var radius;

var flatx;
var flaty;
var flatz;




window.onload = function init()
{   
    //set Event Handlers
    setKeyEventHandler();
    setMouseEventHandler();
    rotY();
    
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.309, 0.505, 0.74, 1.0);
    
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    shaderSetup();
    
    Shapes.initShapes();  // create the primitive and other shapes 
    //
    //Initalizing different textures
    checkerboard = new Checkerboard();
    target = new ImageTexture("../Common/textures/test.jpg");
    noManPardon = new ImageTexture("../Common/textures/noManPardon.png");
    mission = new ImageTexture("../Common/textures/MissionStatus.png");
    clouds = new ImageTexture("../Common/textures/clouds.jpg");
    roof = new ImageTexture("../Common/textures/green-roof.jpg");
    log = new ImageTexture("../Common/textures/log.jpg");
    wood = new ImageTexture("../Common/textures/wood.jpg");
    door = new ImageTexture("../Common/textures/door.jpg");
    stone = new ImageTexture("../Common/textures/stone.jpg");
    fire = new ImageTexture("../Common/textures/fire.png");
    skyline = new ImageTexture("../Common/textures/skyline2.png");
    static = new Static();

    light1.positionY(0); //takes in rotation about y axis, sets light position
    light1.setUp();
    //document.getElementById("beach_sounds").play();
    render();
};

/**
 *  Load shaders, attach shaders to program, obtain handles for 
 *  the attribute and uniform variables.
 * @return {undefined}
 */
function shaderSetup() {
    //  Load shaders
//    program = initShaders(gl, "vertex-shader", "fragment-shader");
//    gl.useProgram(program);

    // get handles for shader attribute variables. 
    // We will need these in setting up buffers.
    vPosition = gl.getAttribLocation(program, "vPosition");
    vColor = gl.getAttribLocation(program, "vColor"); 
    vTexture = gl.getAttribLocation(program, "vTexture");
    // colors but we keep it in for possible use later.
    vNormal = gl.getAttribLocation(program, "vNormal");
   
    // get handles for shader uniform variables: 
    uColor = gl.getUniformLocation(program, "uColor");  // uniform color
    uTexture = gl.getUniformLocation(program, "uTexture");
    uProjection = gl.getUniformLocation(program, "uProjection"); // projection matrix
    uModel_view = gl.getUniformLocation(program, "uModel_view");  // model-view matrix
    
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Left perspective window render
    var projMat = camera.calcProjectionMat();   // Projection matrix  
    gl.uniformMatrix4fv(uProjection, false, flatten(projMat));
    var viewMat = camera.calcViewMat();   // View matrix
    gl.viewport(0,0,canvas.width/2, canvas.height); //viewport of this camera
    dotLocation = vec3(camera.eye[0], (camera.eye[1]+5), camera.eye[2]);
    
    render1(viewMat); //rendering this with perspective view
    
    //Right perspective window render
    projMat = ortho(0,30,0,30,1,2000);
    gl.uniformMatrix4fv(uProjection, false, flatten(projMat));
    viewMat = lookAt(vec3(0, 15, 0), vec3(0,0,0), vec3(1,0,0));   // View matrix
    gl.viewport(canvas.width/2,0,canvas.width/2, canvas.height); //viewport of this camera
    
    render1(viewMat);// rendering this with orthographic view
    requestAnimFrame(render);
}

function render1(viewMat)
{
    var lightshade = mult(viewMat, light1.light_position ); //is a vector
    gl.uniform4fv(uLight_position, lightshade); // camera coordinate system

    stack.clear();
    stack.multiply(viewMat);
    
    // Need these 2 lines since camera is sitting at origin. 
    // Without them, you would be sitting inside the cube.
    // REMOVE once camera controls are working
    // stack.multiply(translate(0, 0, -10)); 
    // gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
  
    
    // light cube
    stack.push();
    var Lposition = vec3(light1.x_pos, light1.y_pos, light1.z_pos);

    viewMat = mult(viewMat, translate(Lposition)); // update modelview transform
    viewMat = mult(viewMat, scalem(.25,.25,.25));   // small cube
    
    gl.uniformMatrix4fv(uModel_view, false, flatten(viewMat)); // set view transform
    gl.uniform4fv(uColor, vec4(0.0, 0.0, 0.0, 1.0));  // set color to green
    gl.uniform1i(gl.getUniformLocation(program, "uColorMode"), 4);
    Shapes.drawPrimitive(Shapes.cube);  // draw cube
   
    
    //fractal landscape
    gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
    gl.uniform4fv(uColor, vec4(0.0, 1.0, 1.0, 1.0)); 
    gl.uniform1i(gl.getUniformLocation(program, "uColorMode"), 3);
    Shapes.drawPrimitive(Shapes.fractal);
    
    stack.pop();
    
    // location dot
    stack.push();
    stack.multiply(translate(dotLocation));
    stack.multiply(scalem(1/4,1/4,1/4));
    gl.uniform4fv(uColor, vec4(1.0,0,0,1.0)); 
    gl.uniform1i(gl.getUniformLocation(program, "uColorMode"), 1);
    gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
    Shapes.drawPrimitive(Shapes.sphere);
    stack.pop(); 
    
    
    //sky sphere
    
    stack.push();  
    stack.multiply(translate(15, 0, 15));
    stack.multiply(scalem(28, 28, 28));
    
    gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
    skyline.activate();
    gl.uniform1i(gl.getUniformLocation(program, "uColorMode"), 0);
    //gl.uniform4fv(uColor, vec4(.5, .5, 1.0, 1.0));
    Shapes.drawPrimitive(Shapes.sphere);
    
    stack.pop();
    
    // house test 
    
    var z = 0;
    for (var i = 0; i< 2*Math.PI; i = i + Math.PI/3)
    {
        z++;
        stack.push();
        stack.multiply(translate(flatx+ (Math.cos(i)*((radius-1)*scaleZG)), flaty, flatz + (Math.sin(i)*((radius-1)*scaleZG))));
        stack.multiply(scalem(1/10, 1/10, 1/10));
        stack.multiply(rotateY(120 + 60*z));
        gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
        gl.uniform1i(gl.getUniformLocation(program, "uColorMode"), 0);
        Shapes.cabin.draw();

        stack.pop();
 
    }
    
    stack.push();
    stack.multiply(translate(flatx, flaty, flatz));
    stack.multiply(scalem(1/8, 1/8, 1/8));
    gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
    gl.uniform1i(gl.getUniformLocation(program, "uColorMode"), 0);
    Shapes.firepit.draw();
    stack.pop();
    
    //water
    stack.push();
    stack.multiply(translate(-15, .001, -15));
    stack.multiply(scalem(2.5, 1, 2.5));
    gl.uniform4fv(uColor, vec4(0.6, 0.2, 0.8, 1.0)); 
    gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
    gl.uniform1i(gl.getUniformLocation(program, "uColorMode"), 2);
    Shapes.water.motion();
    Shapes.initWater();
    Shapes.drawPrimitive(Shapes.water);
    stack.pop();
}

