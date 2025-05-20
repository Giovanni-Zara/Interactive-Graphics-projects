var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

const float EPSILON = 2.0e-4; 	//need it for sphere intersection, i declare it globally -- read on the web to use it for shadow rays bias


bool IntersectRay( inout HitInfo hit, Ray ray );

// Shades the given point and returns the computed color.

vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0);

	//init of what I'll need
	Ray shadow_ray;
	vec3 n = normalize(normal);
	vec3 omega;
	vec3 h;
	float cos_theta;
	float cos_fi;

	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		// TO-DO: Check for shadows

		Light light = lights[i];
		vec3 lightDir = normalize( light.position - position );
		float lightDistance = length( light.position - position );
		HitInfo shadow_hit;

		shadow_ray.dir = lightDir;
		shadow_ray.pos = position;
		
		bool is_shadowed = IntersectRay( shadow_hit, shadow_ray );	//check if the ray hits something

		if (is_shadowed) {
			return 0.0*color;	//if is shadowed, early quit
		}

		// TO-DO: If not shadowed, perform shading using the Blinn model

		omega = shadow_ray.dir;	//omega is the direction of the light
		h = normalize( omega + view );	//h is the half vector
		cos_theta = max( dot( n, omega ), 0.0 );	//cosine of the angle between the normal and the light direction
		cos_fi = max( dot( n, h ), 0.0 );	//cosine of the angle between the normal and the half vector
		vec3 diff = cos_theta * mtl.k_d;	//diffuse color
		vec3 spec = mtl.k_s * pow( cos_fi, mtl.n );	//specular color

		color += light.intensity * (diff + spec);	//add the diffuse and specular color to the final color
		

		//color += mtl.k_d * lights[i].intensity;	// change this line, changed it above - gonna comment this out for further debugging if needed -
	}
	return color;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;

	//params

	//vec3 d = ray.dir;	//direction of the ray
	vec3 o = ray.pos;	//origin of the ray


	for ( int i=0; i<NUM_SPHERES; ++i ) {
		// TO-DO: Test for ray-sphere intersection
		//basically equation of 2nd grade polynomial
		Sphere sphere = spheres[i];
		vec3 oc = sphere.center;
		float r = sphere.radius;

		float a = dot( ray.dir, ray.dir );
		vec3 dist = o - oc;	//distance from the ray to the center of the sphere
		float b = 2.0 * dot( ray.dir, dist );
		float c = dot( dist, dist ) - r * r;	
		float discriminant = b * b -  (4.0 * a * c);	//simplified equation formula, removed the 2b and 4ac

		//if the discriminant is negative, no intersection
		if (discriminant < 0.0) {
			continue;	//no intersection, continue to the next sphere
		}
		// TO-DO: If intersection is found, update the given HitInfo

		float root = sqrt(discriminant);	//need to check both the signs
		float r1 = (-b - root) / (2.0 * a);
		float r2 = (-b + root) / (2.0 * a);
		float ris = r1 < r2 ? r1 : r2;	//the smallest positive root

		//need to check if the ray is in front of the sphere

		if (ris < hit.t && ris > EPSILON) {	//if the ray hits the sphere and is in front of it
			hit.t = ris;
			hit.position = o + ris * ray.dir;
			hit.normal = normalize(hit.position - sphere.center);
			hit.mtl = sphere.mtl;
			foundHit = true;
		}

	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			// TO-DO: Initialize the reflection ray
			
			r.pos = hit.position + hit.normal * EPSILON;	// move the ray a bit
			
			r.dir = reflect( -view , hit.normal );	// reflect the ray

			if ( IntersectRay( h, r ) ) {
				// TO-DO: Hit found, so shade the hit point
				clr += k_s * Shade( h.mtl, h.position, h.normal, view );	//hit point shaded
				view = normalize( -r.dir );

				// TO-DO: Update the loop variables for tracing the next reflection ray
				k_s *= h.mtl.k_s;	// update the reflection coefficient
				hit = h;	// update the hit info
				//r.pos = h.position + h.normal * EPSILON;	// move the ray a bit  ----gonna comment those, giving problems
				//r.dir = reflect( ray.dir, hit.normal );	// reflect the ray
				//r = h;	// and update the ray,----- this was giving error, i think i can0t do this implicit cast -----

			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;