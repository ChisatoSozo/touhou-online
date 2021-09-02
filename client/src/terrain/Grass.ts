import { Color3, PBRMaterial, Quaternion, Texture, Vector3 } from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { Assets } from "../containers/AssetContext";
import { CustomMaterial } from "../forks/CustomMaterial";
import { getModel } from "../hooks/useModel";
import { glsl } from "../utils/MaterialUtils";
import { makeInstances } from "../utils/MeshUtils";
import { LOG_DEPTH } from "../utils/Switches";

export class Grass {

    public grassBase: Mesh;

    constructor(assets: Assets, scene: Scene, heightTexture: Texture, terrainSize: number, terrainResolution: number, terrainHeight: number, grassStart: number, grassDistance: number, grassPerMeter: number, stretching = 1) {
        if (!scene.activeCamera) throw new Error("Scene has no active camera");

        const grass = getModel(assets, "grass", true);
        grass?.mesh.makeGeometryUnique();

        if (!grass) throw new Error("Couldn't find grass model")
        this.grassBase = grass.mesh;
        this.grassBase.scaling = new Vector3(1, 1, 1);
        this.grassBase.rotationQuaternion = new Quaternion()
        this.grassBase.alwaysSelectAsActiveMesh = true;

        const numGrass = Math.pow(grassPerMeter * grassDistance * 2, 2) - Math.pow(grassPerMeter * grassStart * 2, 2)
        makeInstances(this.grassBase, numGrass);
        const sourceMaterial = this.grassBase.material as PBRMaterial;
        const material = new CustomMaterial("grassMat", scene) as CustomMaterial;
        material.specularColor = new Color3(0, 0, 0);
        material.AddUniform("grassPerMeter", "float", grassPerMeter);
        material.AddUniform("grassStart", "float", grassStart);
        material.AddUniform("grassDistance", "float", grassDistance);
        material.AddUniform("stretching", "float", stretching);
        material.AddUniform("cameraPosition", "vec3", scene.activeCamera.globalPosition);
        material.AddUniform("heightTexture", "sampler2D", heightTexture);
        material.AddUniform("terrainSize", "float", terrainSize);
        material.AddUniform("terrainResolution", "float", terrainResolution)
        material.AddUniform("terrainHeight", "float", terrainHeight);

        material.Vertex_Definitions(glsl`
        
            mat3 rotAxis(vec3 axis, float a) {
                float s=sin(a);
                float c=cos(a);
                float oc=1.0-c;
                vec3 as=axis*s;
                mat3 p=mat3(axis.x*axis,axis.y*axis,axis.z*axis);
                mat3 q=mat3(c,-as.z,as.y,as.z,c,-as.x,-as.y,as.x,c);
                return p*oc+q;
            }

            float rand1d(float n){return fract(sin(n) * 43758.5453123);}
            float rand2d(vec2 co){
                return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
            }
            vec2 rand(vec2 co){
                float randNum = rand2d(co);
                return vec2(randNum, rand1d(randNum));
            }
            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

            float snoise(vec2 v){
                const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                    dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            mat3 makeUpRotation(vec3 direction)
            {
                
                vec3 zaxis = cross(vec3(1., 0., 0.), direction);
                zaxis = normalize(zaxis);

                vec3 xaxis = cross(direction, zaxis);
                xaxis = normalize(xaxis);

                return mat3(xaxis, direction, zaxis);
            }
        `)

        material.Vertex_Before_PositionUpdated(glsl`
            int instance = gl_InstanceID;
            float grassPerSide = grassDistance * 2. * grassPerMeter;
            float grassStartPerSide = grassStart * 2. * grassPerMeter;
            float grassPerMiniSection = (grassPerSide - grassStartPerSide)/2.;

            float grassInterval = 1./grassPerMeter;
            float grassWidth = grassDistance - grassStart;

            float grassLongPatch = grassPerSide * grassPerMiniSection;
            float grassWalls = grassStartPerSide * grassPerMiniSection;

            vec2 grassSection1 = vec2(
                float(instance % int(grassPerMiniSection)),
                float(instance / int(grassPerMiniSection))
            );

            vec2 grassSection2 = vec2(
                float((instance - int(grassLongPatch)) % int(grassStartPerSide)),
                float((instance - int(grassLongPatch)) / int(grassStartPerSide))
            ) + vec2(
                grassPerMiniSection,
                0.
            );

            vec2 grassSection3 = vec2(
                float((instance - int(grassLongPatch + grassWalls)) % int(grassStartPerSide)),
                float((instance - int(grassLongPatch + grassWalls)) / int(grassStartPerSide))
            ) + vec2(
                grassPerMiniSection,
                grassPerMiniSection + grassStartPerSide
            );

            vec2 grassSection4 = vec2(
                float((instance - int(grassLongPatch + grassWalls * 2.)) % int(grassPerMiniSection)),
                float((instance - int(grassLongPatch + grassWalls * 2.)) / int(grassPerMiniSection))
            ) + vec2(
                grassPerMiniSection + grassStartPerSide,
                0.
            );

            float isGrassSection1 = float(instance < int(grassLongPatch));
            float isGrassSection2 = float(instance >= int(grassLongPatch) && instance < int(grassLongPatch + grassWalls));
            float isGrassSection3 = float(instance >= int(grassLongPatch + grassWalls) && instance < int(grassLongPatch + grassWalls * 2.));
            float isGrassSection4 = float(instance >= int(grassLongPatch + grassWalls * 2.));

            vec2 positionNew = 
                isGrassSection1 * grassSection1 + 
                isGrassSection2 * grassSection2 + 
                isGrassSection3 * grassSection3 + 
                isGrassSection4 * grassSection4;

            positionNew -= vec2((grassPerSide-1.)/2., (grassPerSide-1.)/2.);
            
            positionNew *= grassInterval;

            float oneSquare = max(1., grassInterval);
            positionNew.x += round(cameraPosition.x / oneSquare) * oneSquare;
            positionNew.y += round(cameraPosition.z / oneSquare) * oneSquare;
            positionNew += rand(positionNew.xy)*(grassInterval*2.);
            
            vec2 uv = (positionNew.yx/terrainSize) + 0.5;
            float pixelSize = 0.5/terrainResolution;
            float cellSize = 0.5*terrainSize*pixelSize;

            float l = texture(heightTexture, vec2(uv.x - pixelSize, uv.y)).x * terrainHeight;
            float u = texture(heightTexture, vec2(uv.x, uv.y + pixelSize)).x * terrainHeight;
            float r = texture(heightTexture, vec2(uv.x + pixelSize, uv.y)).x * terrainHeight;
            float d = texture(heightTexture, vec2(uv.x, uv.y - pixelSize)).x * terrainHeight;

            vec3 vu = vec3(0, u, cellSize);
            vec3 vd = vec3(0, d, -cellSize);
            vec3 vr = vec3(cellSize, r, 0);
            vec3 vl = vec3(-cellSize, l, 0);

            vec3 faceNormal = normalize(cross((vu - vd), (vr - vl)));
            float height = texture(heightTexture, uv).x * terrainHeight;

            float display = float(faceNormal.y > 0.75 && height > 0.340 * terrainHeight && height < 0.55 * terrainHeight);
            
            mat3 rotationMatrix = 
                rotAxis(vec3(1, 0, 0), PI/2.) * 
                rotAxis(vec3(0, 1, 0), rand2d(positionNew) * PI * 2.) *
                makeUpRotation(faceNormal);
            positionUpdated.xy *= stretching;
            positionUpdated *= rotationMatrix;

            positionUpdated *= 1.5 + (snoise(positionNew/8.) * .75);
            
            positionUpdated.xz += positionNew;
            positionUpdated.y += height - 0.1;
            positionUpdated *= display;
            
        `)

        material.Vertex_Before_NormalUpdated(glsl`
            // normalUpdated *= rotationMatrix;
        `)
        material.backFaceCulling = false;
        material.useLogarithmicDepth = LOG_DEPTH;
        const materialTexture = sourceMaterial.albedoTexture as Texture;
        materialTexture.uOffset = 0.1;
        materialTexture.vOffset = 0.1;
        material.disableLighting = true;
        material.emissiveTexture = materialTexture;
        material.diffuseTexture = materialTexture;
        material.emissiveColor = new Color3(3, 3, 3);
        this.grassBase.material = material;


    }
    dispose(): void {
        this.grassBase.dispose()
    }
}