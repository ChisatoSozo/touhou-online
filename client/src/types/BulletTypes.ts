import { RawTexture, Vector3 } from '@babylonjs/core';
import { BulletType } from '../bullets/behaviour/EnemyBulletBehaviour';
import { CustomFloatProceduralTexture } from '../forks/CustomFloatProceduralTexture';
import { RandVectorIn } from '../utils/BabylonUtils';

interface BaseFormOption {
    optional: boolean;
}

interface BooleanFormOption extends BaseFormOption {
    type: 'boolean',
    default: boolean
}

interface NumberFormOption extends BaseFormOption {
    type: 'number',
    default: number,
    min: number,
    max: number
}

interface ColorFormOption extends BaseFormOption {
    type: 'color',
    default: [number, number, number],
}

type FormOption = BooleanFormOption | NumberFormOption | ColorFormOption;
type FormOptions = { [key: string]: FormOption };
export type FormDefinition = { [key: string]: { [key: string]: FormOption } }

interface BaseOptions {
    uid: string;
}

interface BaseMaterialOptions extends BaseOptions {
    doubleSided?: boolean;
    hasAlpha?: boolean;
    alpha?: number;
    glow?: boolean;
}

const BaseMaterialFormOptions: FormOptions = {
    doubleSided: {
        type: 'boolean',
        optional: true,
        default: false
    },
    hasAlpha: {
        type: 'boolean',
        optional: true,
        default: false
    },
    alpha: {
        type: 'number',
        optional: true,
        default: 1,
        min: 0,
        max: 1
    },
    glow: {
        type: 'boolean',
        optional: true,
        default: false
    },
}

interface FresnelMaterialOptions extends BaseMaterialOptions {
    material: 'fresnel'
    color: [number, number, number];
}

const FresnelMaterialFormOptions: FormOptions = {
    ...BaseMaterialFormOptions,
    color: {
        type: 'color',
        optional: false,
        default: [0, 0, 1]
    }
}

export type MaterialOptions = FresnelMaterialOptions;

export const materialForms: FormDefinition = {
    fresnel: FresnelMaterialFormOptions,
}

export interface PatternOptions {
    uid: string;
    pattern: string;
    num: number;
    speed: number;
    radius: number;
    disablePrecomputation?: boolean;
    repeat?: {
        times: number;
        delay: number;
    };
    offset?: RandVectorIn;
    speeds?: number[];
    thetaStart?: number;
    thetaLength?: number;
    yStart?: number;
    yLength?: number;

    sourceBulletId?: string;
}

export interface EndTimingOptions {
    timing: string;
    times?: number[];
    time?: number;
    disablePrecomputation: boolean;
    uid: string;
}

export interface MeshOptions {
    mesh: string;
    radius: number;
    laserLength?: number;
    uid: string;
}

export interface BehaviourOptions {
    behaviour: string;
    bulletValue?: number;
    bulletType?: BulletType;
    translationFromParent?: boolean;
    rotationFromParent?: boolean;
    disableWarning?: boolean;
    uid: string;
}

export interface SoundOptions {
    mute?: boolean;
    sound: string;
    uid: string;
}

export type BulletInstruction = {
    materialOptions: MaterialOptions;
    patternOptions: PatternOptions;
    endTimingOptions: EndTimingOptions;
    meshOptions: MeshOptions;
    behaviourOptions: BehaviourOptions;
    soundOptions: SoundOptions;
    uid: string;
    lifespan: number;
};

export interface UnevalBulletInstruction {
    materialOptions: MaterialOptions;
    patternOptions: PatternOptions;
    endTimingOptions: EndTimingOptions;
    meshOptions: MeshOptions;
    behaviourOptions: BehaviourOptions;
    soundOptions: SoundOptions;
    uid: string;
    lifespan: number;
}

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type PreBulletInstruction = {
    materialOptions: PartialBy<MaterialOptions, 'uid'>;
    patternOptions: PartialBy<PatternOptions, 'uid'>;
    endTimingOptions: PartialBy<EndTimingOptions, 'uid'>;
    meshOptions: PartialBy<MeshOptions, 'uid'>;
    behaviourOptions: PartialBy<BehaviourOptions, 'uid'>;
    soundOptions: SoundOptions;
    lifespan: number;
};

export interface BulletPattern {
    positions: Vector3[] | CustomFloatProceduralTexture;
    velocities: Vector3[];
    timings: number[];
    uid: string;
}

export interface BulletCache {
    textureCache: {
        [uid: string]: {
            initialPositions: RawTexture;
            initialVelocities: RawTexture;
            timings: RawTexture;
            positions: RawTexture;
            velocities: RawTexture;
            collisions: RawTexture;
            endTimings?: RawTexture;
        };
    };
    patterns: {
        [uid: string]: BulletPattern;
    };
    endTimings: {
        [uid: string]: number[];
    };
}
