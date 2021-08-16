import { AbstractMesh, Bone, BoneIKController, MeshBuilder, Quaternion, Scene, Skeleton, Vector3 } from '@babylonjs/core';

type Side = 'left' | 'right';

interface IKDefinition {
    leftShoulderBone: string;
    leftElbowBone: string;
    leftWristBone: string;

    rightShoulderBone: string;
    rightElbowBone: string;
    rightWristBone: string;
}

interface IKBoneRef {
    leftShoulderBone: Bone;
    leftElbowBone: Bone;
    leftWristBone: Bone;

    rightShoulderBone: Bone;
    rightElbowBone: Bone;
    rightWristBone: Bone;
}

export interface AvatarDefinition {
    viewHeight: number;
    ikDefinition: IKDefinition;
}

export default class IKAvatar {
    private mesh: AbstractMesh;
    private skeleton: Skeleton;
    private ikBones?: IKBoneRef;
    private viewHeight: number;

    private leftHandMesh?: AbstractMesh;
    private rightHandMesh?: AbstractMesh;

    private poleTargetMesh?: AbstractMesh;

    private leftBoneIKController?: BoneIKController;
    private rightBoneIKController?: BoneIKController;

    [key: string]: any;

    constructor(scene: Scene, mesh: AbstractMesh, skeleton: Skeleton, avatarDefinition: AvatarDefinition) {
        this.mesh = mesh;
        this.skeleton = skeleton;

        const { ikDefinition, viewHeight } = avatarDefinition;
        this.viewHeight = viewHeight;

        const ikBones = {
            leftShoulderBone: skeleton.bones.find((bone) => bone.id == ikDefinition.leftShoulderBone),
            leftElbowBone: skeleton.bones.find((bone) => bone.id == ikDefinition.leftElbowBone),
            leftWristBone: skeleton.bones.find((bone) => bone.id == ikDefinition.leftWristBone),

            rightShoulderBone: skeleton.bones.find((bone) => bone.id == ikDefinition.rightShoulderBone),
            rightElbowBone: skeleton.bones.find((bone) => bone.id == ikDefinition.rightElbowBone),
            rightWristBone: skeleton.bones.find((bone) => bone.id == ikDefinition.rightWristBone),
        };

        if (Object.values(ikBones).some((bone) => !bone)) {
            return;
        }
        this.ikBones = ikBones as IKBoneRef;

        this.leftHandMesh = MeshBuilder.CreateSphere('', { diameter: 0.1 }, scene);
        this.rightHandMesh = MeshBuilder.CreateSphere('', { diameter: 0.1 }, scene);

        this.poleTargetMesh = MeshBuilder.CreateSphere('', { diameter: 0.1 }, scene);
        this.poleTargetMesh.position = new Vector3(0, 10, 5);

        this.leftBoneIKController = new BoneIKController(mesh, this.ikBones.leftElbowBone, {
            targetMesh: this.leftHandMesh,
            poleTargetMesh: this.poleTargetMesh,
            poleAngle: Math.PI,
        });

        this.rightBoneIKController = new BoneIKController(mesh, this.ikBones.rightElbowBone, {
            targetMesh: this.rightHandMesh,
            poleTargetMesh: this.poleTargetMesh,
            poleAngle: Math.PI,
        });

        this.skeleton.bones[7].scale(0, 0, 0);
    }

    setPosition = (vector: Vector3, compensateHeight: boolean) => {
        this.mesh.position = vector.subtract(new Vector3(0, compensateHeight ? this.viewHeight : 0, 0));
    };

    setRotation = (angle: number) => {
        this.mesh.rotationQuaternion = Quaternion.RotationAxis(Vector3.Up(), angle);
    };

    solveArm = (side: Side, target: Vector3) => {
        if (
            !this.ikBones ||
            !this.leftHandMesh ||
            !this.rightHandMesh ||
            !this.leftBoneIKController ||
            !this.rightBoneIKController ||
            !this.poleTargetMesh
        )
            return;

        this.poleTargetMesh.position = this.mesh.forward.scale(-100).add(new Vector3(0, 50, 0));

        if (side === 'right') {
            this.leftHandMesh.position.copyFrom(target);
            this.leftBoneIKController.update();
        } else {
            this.rightHandMesh.position.copyFrom(target);
            this.rightBoneIKController.update();
        }
    };
}
