import { Vector3 } from "@babylonjs/core";

export const LATERAL_SPEED = 500;
export const SPIN_SPEED = 10;

export const WALK_MAX_SLOPE = 1000;
export const DOUBLE_TAP_TIMING = 300;
export const MAX_MESHES_IN_SCENE = 500000;

export const HEIGHTMAP_MAX_HEIGHT = 65536;
export const MAX_MESH_IN_INSTANCES = 1500000;

export const MAX_ENEMIES = 50;
export const MAX_BOMBS = 8;
export const MAX_BULLETS_PER_GROUP = 100000;
export const PLAYER_BULLETS_WHEEL_LENGTH = 50;

export const ARENA_WIDTH = 15;
export const ARENA_HEIGHT = 10;
export const ARENA_FLOOR = 1;
export const ARENA_LENGTH = 20;
export const ARENA_DIMS = [ARENA_WIDTH, ARENA_HEIGHT, ARENA_LENGTH];
export const ARENA_MAX = new Vector3(ARENA_WIDTH / 2, ARENA_HEIGHT, ARENA_LENGTH / 2);
export const ARENA_MIN = new Vector3(-ARENA_WIDTH / 2, 0, -ARENA_LENGTH / 2);

export const nullNumber = -510;
export const nullVector = new Vector3(nullNumber, nullNumber, nullNumber);
export const zVector = new Vector3(0, 0, 1);

export const GRAZE_DISTANCE = 0.5;
export const PLAYER_INVULNERABLE_COOLDOWN = 2;
export const PLAYER_BOMB_DURATION = 8;
export const TARGET_LENGTH = 15;

export const BULLET_WARNING = 0.2;
export const LASER_WARNING = 1.0;

export const LASER_LENGTH = 10.0;
export type QualityName = 'Low' | 'Med' | 'Hi';
