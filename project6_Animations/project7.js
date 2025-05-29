//THE FOLLOWING IS A COPY-PASTE OF MY CODE FROM THE PROJECT 5


// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
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
	
	var mv = MatrixMult(trans, rot);	//translate

	return mv;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations

		//old project.js code
		
        // Compile shader program
        this.program = InitShaderProgram(meshVS, meshFS);
        
        // Get attribute locations
        this.vertPos = gl.getAttribLocation(this.program, 'pos');
        this.texCoords = gl.getAttribLocation(this.program, 'txc');
		this.normals = gl.getAttribLocation(this.program, 'normal'); //this is new, for normals
        
        // Create buffers
        this.vertPosBuffer = gl.createBuffer();
        this.texCoordBuffer = gl.createBuffer();
		this.normalsBuffer = gl.createBuffer(); //this is new, for normals
        
        // Get uniform locations,they must match the names in the shader code
        this.mvpUniformLoc = gl.getUniformLocation(this.program, "mvp");
		this.mvUniformLoc = gl.getUniformLocation(this.program, "mv");
        this.swapYZUniformLoc = gl.getUniformLocation(this.program, "u_swapYZ"); 
        this.showTextureUniformLoc = gl.getUniformLocation(this.program, "u_showTex"); 
        this.samplerUniformLoc = gl.getUniformLocation(this.program, "tex");
		this.normalMatrixLoc = gl.getUniformLocation(this.program, "normalMatrix");
        this.lightDirLoc = gl.getUniformLocation(this.program, "lightDir");
        this.shininessLoc = gl.getUniformLocation(this.program, "shininess");
        
        // Initialize state
        this.texture = null;
        this.useTexture = false;	// Default to true for texture display
        this.numTriangles = 0;
		this.lightDir = [1, 1, 1]; // Default light direction, -1 because I want light to come from the front
        this.shininess = 30; // Default shininess
		
		// Initialize uniform values immediately
		gl.useProgram(this.program);
		gl.uniform1i(this.showTextureUniformLoc, this.useTexture ? 1 : 0);
		gl.uniform3fv(this.lightDirLoc, this.lightDir);
        gl.uniform1f(this.shininessLoc, this.shininess);
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
        
        // Update texture coordinate buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

		this.numTriangles = vertPos.length / 3;
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.program);
        gl.uniform1i(this.swapYZUniformLoc, swap ? 1 : 0); 
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing

		gl.useProgram(this.program);
		gl.uniformMatrix4fv(this.mvpUniformLoc, false, matrixMVP);
		gl.uniformMatrix4fv(this.mvUniformLoc, false, matrixMV);		
		gl.uniformMatrix3fv(this.normalMatrixLoc, false, matrixNormal);	//normal in 3x3

		//now vertex pos, like other project
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertPosBuffer);
		gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertPos);

		//same for texture coords
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.vertexAttribPointer(this.texCoords, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.texCoords);

		//now normals
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
		gl.vertexAttribPointer(this.normals, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.normals);

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture, THIS IS COPY PASTE FROM LAST PROJECT, same

		this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		gl.generateMipmap(gl.TEXTURE_2D);

		// Set texture parameters
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);


		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
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
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		//same from last project, copy paste
		this.useTexture = show;
        gl.useProgram(this.program);
        gl.uniform1i(this.showTextureUniformLoc, show ? 1 : 0);  // if clause to set 1/0 if show true/false
   
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		this.lightDir = [x, y, -z];	//defined in costructor, here I set
        gl.useProgram(this.program);
        gl.uniform3fv(this.lightDirLoc, this.lightDir); // set the light direction uniform in the shader

	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		this.shininess = shininess;
        gl.useProgram(this.program);
        gl.uniform1f(this.shininessLoc, shininess); 	// set the shininess uniform in the shader

	}
}



// This function is called for every step of the simulation.
// Its job is to advance the simulation for the given time step duration dt.
// It updates the given positions and velocities.
function SimTimeStep( dt, positions, velocities, springs, stiffness, damping, particleMass, gravity, restitution )
{
	var forces = Array( positions.length ); // The total force per particle

	// [TO-DO] Compute the total force of each particle
	//i'm gonna iterate over the particles and compute gravity * the mass
	for (var prtc = 0; prtc < positions.length; prtc++){
		forces[prtc] = new Vec3();	//set to zero
		forces[prtc].set(gravity.mul(particleMass)); // increment -> gravity force * mass
	}

	//now spring forces
	for (var spring = 0; spring < springs.length; spring++) {
		//initialize the forces, f0 and f1
		//var f0 = new vec3(0,0,0);	doing it later, it gave problems idk
		//var f1 = new vec3(0,0,0);

		var s = springs[spring]; //get the spring

		var x0 = positions[s.p0]; //get the first point
		var x1 = positions[s.p1]; //get the other end of the spring

		var p0 = s.p0; //get the spring first index, the first point p0
		var p1 = s.p1; //get the spring second index, second point to connect p1

		var v0 = velocities[s.p0]; //get the first point velocity
  		var v1 = velocities[s.p1]; //get the second point velocity
		
		var rest_len = s.rest; //get the rest length of the spring resting
		var not_rest_len = x0.sub(x1).len(); //get the vector between the two points, basically the length of the spring not in rest condition
		var dir = x1.sub(x0).div(not_rest_len); //get the direction vector between the two ends of the spring

		var f0 = (dir.mul(stiffness * (not_rest_len - rest_len))); //first force -> stiffness of the obj

		var vel_dot = v1.sub(v0).dot(dir); //get the dot product of the velocity vector and the direction vector

		var f1 = (dir.mul(damping * vel_dot)); //second force with the damping of the spring that is applied to the obj physics

		forces[p0].inc(f0);
		forces[p0].inc(f1); //increment the forces of the attaching point, stiffness and damping "bounce"

		forces[p1].dec(f0);
		forces[p1].dec(f1); //decrement the forces of the other end of the string
	
	}
	
	// [TO-DO] Update positions and velocities

	for (prtc = 0; prtc < positions.length; prtc++) {
		var a = forces[prtc].mul(1/particleMass);  // Get acceleration
		var v = velocities[prtc];                   // Get velocity reference
		var p = positions[prtc];                    // Get position reference
		
		a.scale(dt);                                // Scale acceleration by dt
		v.inc(a);                                   // Update velocity
		
		var dv = v.mul(dt);                         // Calculate position change
		var pp = p.add(dv);                         // Calculate new position
		
	// [TO-DO ]Handle collisions
		if(Math.abs(pp.x) >= 1 || Math.abs(pp.y) >= 1 || Math.abs(pp.z) >= 1){
			v.scale(-restitution);                  // Reverse and scale velocity
			continue;                               // Skip position update
		}
		p.set(pp);                                  // Update position if no collision
	}

	
}


//continuation of copypaste from project 5, put here for readability
// vertex shader
var meshVS = `
attribute vec3 pos;	//same as before, for vertex positions
attribute vec2 txc;	//same as before, for texture coordinates
attribute vec3 normal;	//this is new, for normals

uniform mat4 mvp;	//same as before, for model-view-projection matrix
uniform mat4 mv;	// Model-view matrix for transforming positions (new)
uniform mat3 normalMatrix;	// Normal matrix for transforming normals
uniform bool u_swapYZ; // also this same as before

varying vec2 texCoord;	//copied from before
varying vec3 normalVec;	//this is new, normals
varying vec3 viewVec;	//this is new, view vector

void main() {	
    vec3 pos_copy = pos;

    if(u_swapYZ) {	//same stuff as project 3, to swap axes
        float temp = pos_copy.y;
        pos_copy.y = pos_copy.z;
        pos_copy.z = temp;
    }

    gl_Position = mvp * vec4(pos_copy, 1);	//same as before, for position
    texCoord = txc;
    
    // Transform normal and position to view space for shading
    normalVec = normalize(normalMatrix * normal);	// Transform normal using the normal matrix (new)
    viewVec = normalize(-(mv * vec4(pos_copy, 1)).xyz);	// Transform position to view space (new)
}`;

// Fragment shader
var meshFS = `
precision mediump float;	//same as before, for floating point precision

uniform sampler2D tex;	//same as before, for texture
uniform bool u_showTex;	//same as before, for texture display flag
uniform vec3 lightDir;	//this is new, for light direction
uniform float shininess; //also this new, shininess factor

varying vec2 texCoord;	//same as before, for texture coordinates
varying vec3 normalVec;	//new, normal
varying vec3 viewVec;	//new for view vector

void main() {
    vec3 color;
    //same color stuff as project 3, for texture or solid color
    if(u_showTex) {
        color = texture2D(tex, texCoord).rgb;
    } else {
        color = vec3(1.0, 1.0, 1.0);  // Pure white
    }
    
    // Normalize interpolated normal, ------new stuff needed for shading------
    vec3 N = normalize(normalVec);
    vec3 L = normalize(-lightDir);
    vec3 V = normalize(viewVec);
    vec3 H = normalize(L + V);
    
    // Ambient component (optional)
    vec3 ambient = 0.3 * color;
    
    // Diffuse component
    float diff = max(dot(N, L), 0.0);
    vec3 diffuse = diff * color;
    
    // Specular component (Blinn-Phong)
    float spec = pow(max(dot(N, H), 0.0), shininess);
    vec3 specular = spec * vec3(1.0); // White highlights
    
    // Final color
    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}`;
