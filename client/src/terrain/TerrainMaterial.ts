import { Color3, Scene } from "@babylonjs/core";
import { Engine } from "@babylonjs/core/Engines/engine";
import { RawTexture } from "@babylonjs/core/Materials/Textures/rawTexture";
import { CustomMaterial } from "../forks/CustomMaterial";
import { HEIGHTMAP_MAX_HEIGHT } from "../utils/Constants";
import { glsl } from "../utils/MaterialUtils";
import { LOG_DEPTH, SMOOTH_TERRAIN } from "../utils/Switches";

const vertexShader = `
#include<__decl__defaultVertex>
// Attributes

#define CUSTOM_VERTEX_BEGIN

attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef TANGENT
attribute vec4 tangent;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#include<uvAttributeDeclaration>[2..7]
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif

#include<helperFunctions>

#include<bonesDeclaration>

// Uniforms
#include<instancesDeclaration>
#include<prePassVertexDeclaration>

#include<mainUVVaryingDeclaration>[1..7]

#include<samplerVertexDeclaration>(_DEFINENAME_,DIFFUSE,_VARYINGNAME_,Diffuse)
#include<samplerVertexDeclaration>(_DEFINENAME_,DETAIL,_VARYINGNAME_,Detail)
#include<samplerVertexDeclaration>(_DEFINENAME_,AMBIENT,_VARYINGNAME_,Ambient)
#include<samplerVertexDeclaration>(_DEFINENAME_,OPACITY,_VARYINGNAME_,Opacity)
#include<samplerVertexDeclaration>(_DEFINENAME_,EMISSIVE,_VARYINGNAME_,Emissive)
#include<samplerVertexDeclaration>(_DEFINENAME_,LIGHTMAP,_VARYINGNAME_,Lightmap)
#if defined(SPECULARTERM)
#include<samplerVertexDeclaration>(_DEFINENAME_,SPECULAR,_VARYINGNAME_,Specular)
#endif
#include<samplerVertexDeclaration>(_DEFINENAME_,BUMP,_VARYINGNAME_,Bump)

// Output
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif

#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif

#include<bumpVertexDeclaration>

#include<clipPlaneVertexDeclaration>

#include<fogVertexDeclaration>
#include<__decl__lightVxFragment>[0..maxSimultaneousLights]

#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]

#ifdef REFLECTIONMAP_SKYBOX
varying vec3 vPositionUVW;
#endif

#if defined(REFLECTIONMAP_EQUIRECTANGULAR_FIXED) || defined(REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED)
varying vec3 vDirectionW;
#endif

#include<logDepthDeclaration>
#define CUSTOM_VERTEX_DEFINITIONS

void main(void) {

	#define CUSTOM_VERTEX_MAIN_BEGIN

	vec3 positionUpdated = position;
#ifdef NORMAL
	vec3 normalUpdated = normal;
#endif
#ifdef TANGENT
	vec4 tangentUpdated = tangent;
#endif
#ifdef UV1
	vec2 uvUpdated = uv;
#endif

#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]

#ifdef REFLECTIONMAP_SKYBOX
	vPositionUVW = positionUpdated;
#endif

#define CUSTOM_VERTEX_UPDATE_POSITION

#define CUSTOM_VERTEX_UPDATE_NORMAL

#include<instancesVertex>

#if defined(PREPASS) && defined(PREPASS_VELOCITY) && !defined(BONES_VELOCITY_ENABLED)
    // Compute velocity before bones computation
    vCurrentPosition = viewProjection * finalWorld * vec4(positionUpdated, 1.0);
    vPreviousPosition = previousViewProjection * finalPreviousWorld * vec4(positionUpdated, 1.0);
#endif

#include<bonesVertex>

	vec4 worldPos = finalWorld * vec4(positionUpdated, 1.0);

#ifdef NORMAL
	mat3 normalWorld = mat3(finalWorld);

    #if defined(INSTANCES) && defined(THIN_INSTANCES)
        vNormalW = normalUpdated / vec3(dot(normalWorld[0], normalWorld[0]), dot(normalWorld[1], normalWorld[1]), dot(normalWorld[2], normalWorld[2]));
        vNormalW = normalize(normalWorld * vNormalW);
    #else
        #ifdef NONUNIFORMSCALING
            normalWorld = transposeMat3(inverseMat3(normalWorld));
        #endif

        vNormalW = normalize(normalWorld * normalUpdated);
    #endif
#endif

#define CUSTOM_VERTEX_UPDATE_WORLDPOS

#ifdef MULTIVIEW
	if (gl_ViewID_OVR == 0u) {
		gl_Position = viewProjection * worldPos;
	} else {
		gl_Position = viewProjectionR * worldPos;
	}
#else
	gl_Position = viewProjection * worldPos;
#endif

	vPositionW = vec3(worldPos);

#include<prePassVertex>

#if defined(REFLECTIONMAP_EQUIRECTANGULAR_FIXED) || defined(REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED)
	vDirectionW = normalize(vec3(finalWorld * vec4(positionUpdated, 0.0)));
#endif

	// Texture coordinates
#ifndef UV1
	vec2 uvUpdated = vec2(0., 0.);
#endif
#ifdef MAINUV1
	vMainUV1 = uvUpdated;
#endif
    #include<uvVariableDeclaration>[2..7]

    #include<samplerVertexImplementation>(_DEFINENAME_,DIFFUSE,_VARYINGNAME_,Diffuse,_MATRIXNAME_,diffuse,_INFONAME_,DiffuseInfos.x)
    #include<samplerVertexImplementation>(_DEFINENAME_,DETAIL,_VARYINGNAME_,Detail,_MATRIXNAME_,detail,_INFONAME_,DetailInfos.x)
    #include<samplerVertexImplementation>(_DEFINENAME_,AMBIENT,_VARYINGNAME_,Ambient,_MATRIXNAME_,ambient,_INFONAME_,AmbientInfos.x)
    #include<samplerVertexImplementation>(_DEFINENAME_,OPACITY,_VARYINGNAME_,Opacity,_MATRIXNAME_,opacity,_INFONAME_,OpacityInfos.x)
    #include<samplerVertexImplementation>(_DEFINENAME_,EMISSIVE,_VARYINGNAME_,Emissive,_MATRIXNAME_,emissive,_INFONAME_,EmissiveInfos.x)
    #include<samplerVertexImplementation>(_DEFINENAME_,LIGHTMAP,_VARYINGNAME_,Lightmap,_MATRIXNAME_,lightmap,_INFONAME_,LightmapInfos.x)
    #if defined(SPECULARTERM)
    #include<samplerVertexImplementation>(_DEFINENAME_,SPECULAR,_VARYINGNAME_,Specular,_MATRIXNAME_,specular,_INFONAME_,SpecularInfos.x)
    #endif
    #include<samplerVertexImplementation>(_DEFINENAME_,BUMP,_VARYINGNAME_,Bump,_MATRIXNAME_,bump,_INFONAME_,BumpInfos.x)

#include<bumpVertex>
#include<clipPlaneVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]

#ifdef VERTEXCOLOR
	// Vertex color
	vColor = color;
#endif

#include<pointCloudVertex>
#include<logDepthVertex>

#define CUSTOM_VERTEX_MAIN_END

}
`

const fragmentShader = `
#include<__decl__defaultFragment>

#if defined(BUMP) || !defined(NORMAL)
#extension GL_OES_standard_derivatives : enable
#endif

#include<prePassDeclaration>[SCENE_MRT_COUNT]

#define CUSTOM_FRAGMENT_BEGIN

#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif

// Constants
#define RECIPROCAL_PI2 0.15915494

// Input
varying vec3 vPositionW;

#ifdef NORMAL
varying vec3 vNormalW;
#endif

#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif

#include<mainUVVaryingDeclaration>[1..7]

// Helper functions
#include<helperFunctions>

// Lights
#include<__decl__lightFragment>[0..maxSimultaneousLights]

#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>

// Samplers
#include<samplerFragmentDeclaration>(_DEFINENAME_,DIFFUSE,_VARYINGNAME_,Diffuse,_SAMPLERNAME_,diffuse)
#include<samplerFragmentDeclaration>(_DEFINENAME_,AMBIENT,_VARYINGNAME_,Ambient,_SAMPLERNAME_,ambient)
#include<samplerFragmentDeclaration>(_DEFINENAME_,OPACITY,_VARYINGNAME_,Opacity,_SAMPLERNAME_,opacity)
#include<samplerFragmentDeclaration>(_DEFINENAME_,EMISSIVE,_VARYINGNAME_,Emissive,_SAMPLERNAME_,emissive)
#include<samplerFragmentDeclaration>(_DEFINENAME_,LIGHTMAP,_VARYINGNAME_,Lightmap,_SAMPLERNAME_,lightmap)

#ifdef REFRACTION

#ifdef REFRACTIONMAP_3D
uniform samplerCube refractionCubeSampler;
#else
uniform sampler2D refraction2DSampler;
#endif

#endif

#if defined(SPECULARTERM)
    #include<samplerFragmentDeclaration>(_DEFINENAME_,SPECULAR,_VARYINGNAME_,Specular,_SAMPLERNAME_,specular)
#endif

// Fresnel
#include<fresnelFunction>

// Reflection
#ifdef REFLECTION
#ifdef REFLECTIONMAP_3D
uniform samplerCube reflectionCubeSampler;
#else
uniform sampler2D reflection2DSampler;
#endif

#ifdef REFLECTIONMAP_SKYBOX
varying vec3 vPositionUVW;
#else
#if defined(REFLECTIONMAP_EQUIRECTANGULAR_FIXED) || defined(REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED)
varying vec3 vDirectionW;
#endif

#endif

#include<reflectionFunction>

#endif

#include<imageProcessingDeclaration>

#include<imageProcessingFunctions>

#include<bumpFragmentMainFunctions>
#include<bumpFragmentFunctions>
#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>

#define CUSTOM_FRAGMENT_DEFINITIONS

void main(void) {

#define CUSTOM_FRAGMENT_MAIN_BEGIN

#include<clipPlaneFragment>



	vec3 viewDirectionW = normalize(vEyePosition.xyz - vPositionW);

	// Base color
	vec4 baseColor = vec4(1., 1., 1., 1.);
	vec3 diffuseColor = vDiffuseColor.rgb;
	
	

	// Alpha
	float alpha = vDiffuseColor.a;

	// Bump
#ifdef NORMAL
	vec3 normalW = normalize(vNormalW);
#else
	vec3 normalW = normalize(-cross(dFdx(vPositionW), dFdy(vPositionW)));
#endif

#include<bumpFragment>

#ifdef TWOSIDEDLIGHTING
	normalW = gl_FrontFacing ? normalW : -normalW;
#endif

#ifdef DIFFUSE
	baseColor = texture2D(diffuseSampler, vDiffuseUV + uvOffset);

	#if defined(ALPHATEST) && !defined(ALPHATEST_AFTERALLALPHACOMPUTATIONS)
		if (baseColor.a < alphaCutOff)
			discard;
	#endif

	#ifdef ALPHAFROMDIFFUSE
		alpha *= baseColor.a;
	#endif
	
	#define CUSTOM_FRAGMENT_UPDATE_ALPHA

	baseColor.rgb *= vDiffuseInfos.y;
#endif



#include<depthPrePass>

#ifdef VERTEXCOLOR
	baseColor.rgb *= vColor.rgb;
#endif

#ifdef DETAIL
    baseColor.rgb = baseColor.rgb * 2.0 * mix(0.5, detailColor.r, vDetailInfos.y);
#endif

#define CUSTOM_FRAGMENT_UPDATE_DIFFUSE

	// Ambient color
	vec3 baseAmbientColor = vec3(1., 1., 1.);

#ifdef AMBIENT
	baseAmbientColor = texture2D(ambientSampler, vAmbientUV + uvOffset).rgb * vAmbientInfos.y;
#endif

#define CUSTOM_FRAGMENT_BEFORE_LIGHTS

	// Specular map
#ifdef SPECULARTERM
	float glossiness = vSpecularColor.a;
	vec3 specularColor = vSpecularColor.rgb;

#ifdef SPECULAR
	vec4 specularMapColor = texture2D(specularSampler, vSpecularUV + uvOffset);
	specularColor = specularMapColor.rgb;
#ifdef GLOSSINESS
	glossiness = glossiness * specularMapColor.a;
#endif
#endif
#else
	float glossiness = 0.;
#endif

	// Lighting
	vec3 diffuseBase = vec3(0., 0., 0.);
	lightingInfo info;
#ifdef SPECULARTERM
	vec3 specularBase = vec3(0., 0., 0.);
#endif
	float shadow = 1.;

#ifdef LIGHTMAP
	vec4 lightmapColor = texture2D(lightmapSampler, vLightmapUV + uvOffset);
    #ifdef RGBDLIGHTMAP
        lightmapColor.rgb = fromRGBD(lightmapColor);
    #endif
	lightmapColor.rgb *= vLightmapInfos.y;
#endif

#include<lightFragment>[0..maxSimultaneousLights]

	// Refraction
	vec4 refractionColor = vec4(0., 0., 0., 1.);

#ifdef REFRACTION
	vec3 refractionVector = normalize(refract(-viewDirectionW, normalW, vRefractionInfos.y));
	#ifdef REFRACTIONMAP_3D
        #ifdef USE_LOCAL_REFRACTIONMAP_CUBIC
            refractionVector = parallaxCorrectNormal(vPositionW, refractionVector, vRefractionSize, vRefractionPosition);
        #endif
		refractionVector.y = refractionVector.y * vRefractionInfos.w;

		if (dot(refractionVector, viewDirectionW) < 1.0) {
			refractionColor = textureCube(refractionCubeSampler, refractionVector);
		}
	#else
		vec3 vRefractionUVW = vec3(refractionMatrix * (view * vec4(vPositionW + refractionVector * vRefractionInfos.z, 1.0)));

		vec2 refractionCoords = vRefractionUVW.xy / vRefractionUVW.z;

		refractionCoords.y = 1.0 - refractionCoords.y;
		
		refractionColor = texture2D(refraction2DSampler, refractionCoords);
	#endif
    #ifdef RGBDREFRACTION
        refractionColor.rgb = fromRGBD(refractionColor);
    #endif
	#ifdef IS_REFRACTION_LINEAR
		refractionColor.rgb = toGammaSpace(refractionColor.rgb);
	#endif
	refractionColor.rgb *= vRefractionInfos.x;
#endif

// Reflection
vec4 reflectionColor = vec4(0., 0., 0., 1.);

#ifdef REFLECTION
	vec3 vReflectionUVW = computeReflectionCoords(vec4(vPositionW, 1.0), normalW);
	#ifdef REFLECTIONMAP_OPPOSITEZ
		vReflectionUVW.z *= -1.0;
	#endif

	#ifdef REFLECTIONMAP_3D
		#ifdef ROUGHNESS
			float bias = vReflectionInfos.y;

			#ifdef SPECULARTERM
				#ifdef SPECULAR
					#ifdef GLOSSINESS
						bias *= (1.0 - specularMapColor.a);
					#endif
				#endif
			#endif

			reflectionColor = textureCube(reflectionCubeSampler, vReflectionUVW, bias);
		#else
			reflectionColor = textureCube(reflectionCubeSampler, vReflectionUVW);
		#endif
	#else
		vec2 coords = vReflectionUVW.xy;

		#ifdef REFLECTIONMAP_PROJECTION
			coords /= vReflectionUVW.z;
		#endif

		coords.y = 1.0 - coords.y;
		reflectionColor = texture2D(reflection2DSampler, coords);
	#endif
    #ifdef RGBDREFLECTION
        reflectionColor.rgb = fromRGBD(reflectionColor);
    #endif
	#ifdef IS_REFLECTION_LINEAR
		reflectionColor.rgb = toGammaSpace(reflectionColor.rgb);
	#endif
	reflectionColor.rgb *= vReflectionInfos.x;
	#ifdef REFLECTIONFRESNEL
		float reflectionFresnelTerm = computeFresnelTerm(viewDirectionW, normalW, reflectionRightColor.a, reflectionLeftColor.a);

		#ifdef REFLECTIONFRESNELFROMSPECULAR
			#ifdef SPECULARTERM
				reflectionColor.rgb *= specularColor.rgb * (1.0 - reflectionFresnelTerm) + reflectionFresnelTerm * reflectionRightColor.rgb;
			#else
				reflectionColor.rgb *= reflectionLeftColor.rgb * (1.0 - reflectionFresnelTerm) + reflectionFresnelTerm * reflectionRightColor.rgb;
			#endif
		#else
			reflectionColor.rgb *= reflectionLeftColor.rgb * (1.0 - reflectionFresnelTerm) + reflectionFresnelTerm * reflectionRightColor.rgb;
		#endif
	#endif
#endif

#ifdef REFRACTIONFRESNEL
	float refractionFresnelTerm = computeFresnelTerm(viewDirectionW, normalW, refractionRightColor.a, refractionLeftColor.a);

	refractionColor.rgb *= refractionLeftColor.rgb * (1.0 - refractionFresnelTerm) + refractionFresnelTerm * refractionRightColor.rgb;
#endif

#ifdef OPACITY
	vec4 opacityMap = texture2D(opacitySampler, vOpacityUV + uvOffset);

#ifdef OPACITYRGB
	opacityMap.rgb = opacityMap.rgb * vec3(0.3, 0.59, 0.11);
	alpha *= (opacityMap.x + opacityMap.y + opacityMap.z)* vOpacityInfos.y;
#else
	alpha *= opacityMap.a * vOpacityInfos.y;
#endif

#endif

#ifdef VERTEXALPHA
	alpha *= vColor.a;
#endif

#ifdef OPACITYFRESNEL
	float opacityFresnelTerm = computeFresnelTerm(viewDirectionW, normalW, opacityParts.z, opacityParts.w);

	alpha += opacityParts.x * (1.0 - opacityFresnelTerm) + opacityFresnelTerm * opacityParts.y;
#endif

#ifdef ALPHATEST
    #ifdef ALPHATEST_AFTERALLALPHACOMPUTATIONS
        if (alpha < alphaCutOff)
            discard;
    #endif
    #ifndef ALPHABLEND
        // Prevent to blend with the canvas.
        alpha = 1.0;
    #endif
#endif

	// Emissive
	vec3 emissiveColor = vEmissiveColor;
#ifdef EMISSIVE
	emissiveColor += texture2D(emissiveSampler, vEmissiveUV + uvOffset).rgb * vEmissiveInfos.y;
#endif

#ifdef EMISSIVEFRESNEL
	float emissiveFresnelTerm = computeFresnelTerm(viewDirectionW, normalW, emissiveRightColor.a, emissiveLeftColor.a);

	emissiveColor *= emissiveLeftColor.rgb * (1.0 - emissiveFresnelTerm) + emissiveFresnelTerm * emissiveRightColor.rgb;
#endif

	// Fresnel
#ifdef DIFFUSEFRESNEL
	float diffuseFresnelTerm = computeFresnelTerm(viewDirectionW, normalW, diffuseRightColor.a, diffuseLeftColor.a);

	diffuseBase *= diffuseLeftColor.rgb * (1.0 - diffuseFresnelTerm) + diffuseFresnelTerm * diffuseRightColor.rgb;
#endif

	// Composition
#ifdef EMISSIVEASILLUMINATION
	vec3 finalDiffuse = clamp(diffuseBase * diffuseColor + vAmbientColor, 0.0, 1.0) * baseColor.rgb;
#else
#ifdef LINKEMISSIVEWITHDIFFUSE
	vec3 finalDiffuse = clamp((diffuseBase + emissiveColor) * diffuseColor + vAmbientColor, 0.0, 1.0) * baseColor.rgb;
#else
	vec3 finalDiffuse = clamp(diffuseBase * diffuseColor + emissiveColor + vAmbientColor, 0.0, 1.0) * baseColor.rgb;
#endif
#endif

#ifdef SPECULARTERM
	vec3 finalSpecular = specularBase * specularColor;
	#ifdef SPECULAROVERALPHA
		alpha = clamp(alpha + dot(finalSpecular, vec3(0.3, 0.59, 0.11)), 0., 1.);
	#endif
#else
	vec3 finalSpecular = vec3(0.0);
#endif

#ifdef REFLECTIONOVERALPHA
	alpha = clamp(alpha + dot(reflectionColor.rgb, vec3(0.3, 0.59, 0.11)), 0., 1.);
#endif

	// Composition
#ifdef EMISSIVEASILLUMINATION
	vec4 color = vec4(clamp(finalDiffuse * baseAmbientColor + finalSpecular + reflectionColor.rgb + emissiveColor + refractionColor.rgb, 0.0, 1.0), alpha);
#else
	vec4 color = vec4(finalDiffuse * baseAmbientColor + finalSpecular + reflectionColor.rgb + refractionColor.rgb, alpha);
#endif

//Old lightmap calculation method
#ifdef LIGHTMAP
    #ifndef LIGHTMAPEXCLUDED
        #ifdef USELIGHTMAPASSHADOWMAP
            color.rgb *= lightmapColor.rgb;
        #else
            color.rgb += lightmapColor.rgb;
        #endif
    #endif
#endif

#define CUSTOM_FRAGMENT_BEFORE_FOG
color.rgb = max(color.rgb, 0.);
#include<logDepthFragment>
#include<fogFragment>

// Apply image processing if relevant. As this applies in linear space, 
// We first move from gamma to linear.
#ifdef IMAGEPROCESSINGPOSTPROCESS
	color.rgb = toLinearSpace(color.rgb);
#else
	#ifdef IMAGEPROCESSING
		color.rgb = toLinearSpace(color.rgb);
		color = applyImageProcessing(color);
	#endif
#endif

	color.a *= visibility;

#ifdef PREMULTIPLYALPHA
	// Convert to associative (premultiplied) format if needed.
	color.rgb *= color.a;
#endif

#define CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR
#ifdef PREPASS
	float writeGeometryInfo = color.a > 0.4 ? 1.0 : 0.0;

    gl_FragData[0] = color; // We can't split irradiance on std material
    
    #ifdef PREPASS_POSITION
    gl_FragData[PREPASS_POSITION_INDEX] = vec4(vPositionW, writeGeometryInfo);
    #endif

    #ifdef PREPASS_VELOCITY
    vec2 a = (vCurrentPosition.xy / vCurrentPosition.w) * 0.5 + 0.5;
    vec2 b = (vPreviousPosition.xy / vPreviousPosition.w) * 0.5 + 0.5;

    vec2 velocity = abs(a - b);
    velocity = vec2(pow(velocity.x, 1.0 / 3.0), pow(velocity.y, 1.0 / 3.0)) * sign(a - b) * 0.5 + 0.5;

    gl_FragData[PREPASS_VELOCITY_INDEX] = vec4(velocity, 0.0, writeGeometryInfo);
    #endif

    #ifdef PREPASS_IRRADIANCE
        gl_FragData[PREPASS_IRRADIANCE_INDEX] = vec4(0.0, 0.0, 0.0, writeGeometryInfo); //  We can't split irradiance on std material
    #endif

    #ifdef PREPASS_DEPTH
        gl_FragData[PREPASS_DEPTH_INDEX] = vec4(vViewPos.z, 0.0, 0.0, writeGeometryInfo); // Linear depth
    #endif

    #ifdef PREPASS_NORMAL
        gl_FragData[PREPASS_NORMAL_INDEX] = vec4((view * vec4(normalW, 0.0)).rgb, writeGeometryInfo); // Normal
    #endif

    #ifdef PREPASS_ALBEDO
        gl_FragData[PREPASS_ALBEDO_INDEX] = vec4(0.0, 0.0, 0.0, writeGeometryInfo); // We can't split albedo on std material
    #endif
    #ifdef PREPASS_REFLECTIVITY
        #if defined(SPECULAR)
            gl_FragData[PREPASS_REFLECTIVITY_INDEX] = vec4(specularMapColor.rgb, writeGeometryInfo);
        #else
            gl_FragData[PREPASS_REFLECTIVITY_INDEX] = vec4(0.0, 0.0, 0.0, writeGeometryInfo);
        #endif
    #endif
#endif

#if !defined(PREPASS) || defined(WEBGL2) 
	gl_FragColor = color;
#endif

}
`

export const createTerrainMaterial = async (heightmapEndpoint: string, size: number, height: number, scene: Scene) => {
	if (!scene.activeCamera) throw new Error("Attempt to construct material with no active camera")
	const material = new CustomMaterial("myMaterial", scene) as CustomMaterial;
	const data: { data: number[] } = await fetch(heightmapEndpoint, { mode: 'cors' }).then(response => response.json());
	const heightData = new Float32Array(data.data.length * 4)
	data.data.forEach((datum, i) => {
		heightData[i * 4] = datum / HEIGHTMAP_MAX_HEIGHT;
		heightData[i * 4 + 1] = datum / HEIGHTMAP_MAX_HEIGHT;
		heightData[i * 4 + 2] = datum / HEIGHTMAP_MAX_HEIGHT;
		heightData[i * 4 + 3] = datum / HEIGHTMAP_MAX_HEIGHT;
	})
	const resolution = Math.sqrt(data.data.length)

	const logRes = Math.log2(resolution - 1)
	if (logRes !== Math.floor(logRes)) {
		throw new Error("heightmap must be one more than a power of two, is: " + resolution)
	}

	const heightTexture = RawTexture.CreateRGBATexture(heightData, resolution, resolution, scene, false, false, undefined, Engine.TEXTURETYPE_FLOAT);
	material.AddUniform("heightmap", "sampler2D", heightTexture);
	material.AddUniform("size", "float", size);
	material.AddUniform("resolution", "float", resolution);
	material.AddUniform("heightScale", "float", height);
	material.AddUniform("cameraPosition", "vec3", scene.activeCamera.globalPosition);
	material.wireframe = true;

	material.Vertex_Definitions(glsl`
		varying vec3 vPositionHMap;
	`)

	material.Vertex_Before_PositionUpdated(glsl`
		float squareSize = 1.;
		float oneSquare = squareSize * 20.;

		vec3 updatedCamera = (cameraPosition)
			/ vec3(size, size, size)
			* vec3(resolution, resolution, resolution);

		positionUpdated.x += round(updatedCamera.x / oneSquare) * oneSquare;
		positionUpdated.z += round(updatedCamera.z / oneSquare) * oneSquare;

		vec2 terrainCoord = vec2(positionUpdated.z + 0.5, positionUpdated.x + 0.5);
		vec2 uv = terrainCoord/vec2(resolution, resolution);
		float height = texture(heightmap, uv).x;
		vPositionHMap = positionUpdated.xyz + vec3(0., height * heightScale, 0.);
		positionUpdated.y += height * heightScale;
	`)


	if (SMOOTH_TERRAIN) material.Vertex_Before_NormalUpdated(glsl`
		float cellSize = 2.*size/resolution;

		float l = texture(heightmap, vec2(uv.x - 1./resolution, uv.y)).x * heightScale;
		float u = texture(heightmap, vec2(uv.x, uv.y + 1./resolution)).x * heightScale;
		float r = texture(heightmap, vec2(uv.x + 1./resolution, uv.y)).x * heightScale;
		float d = texture(heightmap, vec2(uv.x, uv.y - 1./resolution)).x * heightScale;

		vec3 vu = vec3(0, u, cellSize);
		vec3 vd = vec3(0, d, -cellSize);
		vec3 vr = vec3(cellSize, r, 0);
		vec3 vl = vec3(-cellSize, l, 0);

		normalUpdated = normalize(cross((vu - vd), (vr - vl)));
	`)


	material.Fragment_Definitions(glsl`
		varying vec3 vPositionHMap;

		float invLerp(float x, float y, float a){
			return clamp((a - x) / (y - x), 0., 1.);
		}
	`)

	material.Fragment_Custom_Diffuse(glsl`
		float normHeight = vPositionHMap.y/heightScale;

		vec3 grass = vec3(0., .6, .2);
		vec3 sand = vec3(.76, .70, .50);
		vec3 rock = vec3(.35, .3, .25);
		vec3 snow = vec3(1.0, 1.0, 1.0);

		//grass
		vec3 ground = grass;

		//becomeRock?
		float isRock = invLerp(0.75, 0.70, vNormalW.y);
		ground = mix(ground, rock, isRock);

		//becomeSand?
		float isSand = invLerp(0.345, 0.335, normHeight);
		ground = mix(ground, sand, isSand);

		//becomeSnow?
		float isSnow = invLerp(0.57, 0.63, normHeight);
		ground = mix(ground, snow, isSnow);

		result = ground;
	`)



	material.useLogarithmicDepth = LOG_DEPTH;
	material.specularColor = new Color3(0, 0, 0)

	return { resolution, material, heightMap: data.data }
}