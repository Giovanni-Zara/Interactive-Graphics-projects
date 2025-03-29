// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	let matrix = Array(9);

	rotation = (rotation * Math.PI / 180);		//converting degrees to radians


	let m11 = Math.cos(rotation) * scale;		//computing rotations
	let m21 = Math.sin(rotation) * scale;

	let m12 = -Math.sin(rotation) * scale;	//computing rotations
	let m22 = Math.cos(rotation) * scale;

	let m13 = positionX;			//assigning positions
	let m23 = positionY;

	let m31 = 0;
	let m32 = 0;
	let m33 = 1;			//homogeneus

	matrix[0] = m11;
	matrix[1] = m21;
	matrix[2] = m31;
	matrix[3] = m12;
	matrix[4] = m22;
	matrix[5] = m32;
	matrix[6] = m13;
	matrix[7] = m23;
	matrix[8] = m33;


	return matrix;
}

/*
**array[0]	array[3]	array[6]**					

**array[1]	array[4]	array[7]**

**array[2]	array[5]	array[8]**
*/
/*
0 3 6		0 3 6
1 4 7		1 4 7
2 5 8		2 5 8
*/
// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	let ris = Array(9);

	ris[0] = (trans2[0] * trans1[0]) + (trans2[3] * trans1[1]) + (trans2[6] * trans1[2]);
	ris[3] = (trans2[0] * trans1[3]) + (trans2[3] * trans1[4]) + (trans2[6] * trans1[5]);
	ris[6] = (trans2[0] * trans1[6]) + (trans2[3] * trans1[7]) + (trans2[6] * trans1[8]);

	ris[1] = (trans2[1] * trans1[0]) + (trans2[4] * trans1[1]) + (trans2[7] * trans1[2]);
	ris[4] = (trans2[1] * trans1[3]) + (trans2[4] * trans1[4]) + (trans2[7] * trans1[5]);
	ris[7] = (trans2[1] * trans1[6]) + (trans2[4] * trans1[7]) + (trans2[7] * trans1[8]);

	ris[2] = (trans2[2] * trans1[0]) + (trans2[5] * trans1[1]) + (trans2[8] * trans1[2]);
	ris[5] = (trans2[2] * trans1[3]) + (trans2[5] * trans1[4]) + (trans2[8] * trans1[7]);
	ris[8] = (trans2[2] * trans1[2]) + (trans2[5] * trans1[5]) + (trans2[8] * trans1[8]);



	return ris;
}
