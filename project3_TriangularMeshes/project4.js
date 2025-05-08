// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	let cosx = Math.cos(rotationX);
	let sinx = Math.sin(rotationX);

	var rotX = [
		1, 	0, 	0,		0,
		0, cosx,-sinx, 0,
		0, sinx, cosx, 0,
		0,	0, 	0,		 1
	
	];

	let cosy = Math.cos(rotationY);
	let siny = Math.sin(rotationY);

	
	var rotY = [
		cosy,	 0, 	siny,	 0,
		0, 		1,		 0,		 0,
		-siny,	 0,		 cosy, 	0,
		0,		 0,		 0,		1
	];

	var rot = MatrixMult( rotX, rotY );	//rotate

	var tran = MatrixMult(trans, rot,);	//translate

	var mvp = MatrixMult( projectionMatrix, tran )	//project
	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer {
    constructor() {
		// [TO-DO] initializations
		// The constructor of this class is called after WebGL is initialized, 
		// so we can handle WebGL related initializations for rendering within the constructor.

		
        // Compile shader program
        this.program = InitShaderProgram(meshVS, meshFS);
        
        // Get attribute locations
        this.vertPos = gl.getAttribLocation(this.program, 'pos');
        this.texCoords = gl.getAttribLocation(this.program, 'txc');  // Changed from 'texCoord'
        
        // Create buffers
        this.vertPosBuffer = gl.createBuffer();
        this.texCoordBuffer = gl.createBuffer();
        
        // Get uniform locations,they must match the names in the shader code
        this.mvpUniformLoc = gl.getUniformLocation(this.program, "mvp");
        this.swapYZUniformLoc = gl.getUniformLocation(this.program, "u_swapYZ");  // Changed from 'swapYZ'
        this.showTextureUniformLoc = gl.getUniformLocation(this.program, "u_showTex");  // Changed from 'showTexture'
        this.samplerUniformLoc = gl.getUniformLocation(this.program, "tex");
        
        // Initialize state
        this.texture = null;
        this.useTexture = false;	// Default to true for texture display
        this.numTriangles = 0;
		
		// Initialize uniform values immediately
		gl.useProgram(this.program);
		gl.uniform1i(this.showTextureUniformLoc, this.useTexture ? 1 : 0)
	}

    
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions (From Object space...)
	// and an array of 2D texture coordinates. (...to Texture space)
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
    setMesh(vertPos, texCoords) {
        // Update vertex position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
        
        // Update texture coordinate buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
        
        this.numTriangles = vertPos.length / 3;
    }
    
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.

    swapYZ(swap) {
        gl.useProgram(this.program);
        gl.uniform1i(this.swapYZUniformLoc, swap ? 1 : 0);  // Use 1/0 instead of true/false
    }
    
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
    draw(trans) {
		// [TO-DO] Complete the WebGL initializations before drawing

        gl.useProgram(this.program);
        gl.uniformMatrix4fv(this.mvpUniformLoc, false, trans);
        
        // Set up vertex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertPosBuffer);
        gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vertPos);
        
        // Set up texture coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.vertexAttribPointer(this.texCoords, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.texCoords);
        
        // Bind texture if available, don't think this is needed it gave problems
        /*if (this.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this.samplerUniformLoc, 0);
        }*/
        
        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
    }
    
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.

    setTexture(img) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        
		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.

        
        // Upload image data
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);

		// Set texture parameters
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Initialize texture-related uniforms
        gl.useProgram(this.program);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		// Set the sampler uniform to use texture unit 0
		// (this is the default texture unit for WebGL)
        gl.uniform1i(this.samplerUniformLoc, 0);
		gl.uniform1i(this.showTextureUniformLoc, true);
    }
    // This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
    showTexture(show) {
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
        this.useTexture = show;
        gl.useProgram(this.program);
        gl.uniform1i(this.showTextureUniformLoc, show ? 1 : 0);  // if clause to set 1/0 if show true/false
    }
}

// Vertex shader source code -> transforms each vertex of the mesh into its final 2D screen position
// ===== VERTEX SHADER ===== //
// for processing each vertex of the 3D model
var	 meshVS = `
//  raw 3D position of this vertex from JavaScript
attribute vec3 pos;

// I also get the texture coordinates (UV mapping) for this vertex
attribute vec2 txc;

// This is the combined transformation matrix sent from JavaScript
uniform mat4 mvp;

// I'll pass the texture coordinates to the fragment shader
varying vec2 texCoord;

// Flag to tell me if I should swap Y/Z coordinates
uniform bool u_swapYZ;

void main()
{	
    // First I make a copy of the position so I don't modify the original
    vec3 pos_copy = pos;

    // If the swap flag is set, I'll exchange Y and Z coordinates
    if(u_swapYZ) {
        float temp = pos_copy.y;
        pos_copy.y = pos_copy.z;
        pos_copy.z = temp;
    }

    // I transform the 3D position to 2D screen space using the matrix
    gl_Position = mvp * vec4(pos_copy, 1);

    // I pass along the texture coordinates unchanged to the fragment shader
    texCoord = txc;
}`;

// ===== FRAGMENT SHADER ===== //
// for determining the color of each pixel
var meshFS = `
// I need this for floating point precision
precision mediump float;

// The texture image sent from JavaScript
uniform sampler2D tex;

// I receive the interpolated texture coordinate from the vertex shader
varying vec2 texCoord;

// Flag to control whether I show the texture or a solid color
uniform bool u_showTex;

void main()
{
    // If texture display
    if(u_showTex) {
        // I look up the color from the texture at these coordinates
        gl_FragColor = texture2D(tex, texCoord);
    }
    else {
        // fallback color: yellow with depth-based green
        gl_FragColor = vec4(
            1.0,                    // Full red
            gl_FragCoord.z*gl_FragCoord.z, // Green based on depth (darker when farther)
            0.0,                    // No blue
            1.0                     // Fully opaque
        );
    }
}`;