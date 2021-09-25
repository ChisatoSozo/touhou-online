// package: touhou
// file: touhou.proto

import * as jspb from "google-protobuf";

export class Empty extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Empty.AsObject;
  static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Empty;
  static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty;
}

export namespace Empty {
  export type AsObject = {
  }
}

export class Vector3D extends jspb.Message {
  getX(): number;
  setX(value: number): void;

  getY(): number;
  setY(value: number): void;

  getZ(): number;
  setZ(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Vector3D.AsObject;
  static toObject(includeInstance: boolean, msg: Vector3D): Vector3D.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Vector3D, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Vector3D;
  static deserializeBinaryFromReader(message: Vector3D, reader: jspb.BinaryReader): Vector3D;
}

export namespace Vector3D {
  export type AsObject = {
    x: number,
    y: number,
    z: number,
  }
}

export class Quaternion4D extends jspb.Message {
  getX(): number;
  setX(value: number): void;

  getY(): number;
  setY(value: number): void;

  getZ(): number;
  setZ(value: number): void;

  getW(): number;
  setW(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Quaternion4D.AsObject;
  static toObject(includeInstance: boolean, msg: Quaternion4D): Quaternion4D.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Quaternion4D, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Quaternion4D;
  static deserializeBinaryFromReader(message: Quaternion4D, reader: jspb.BinaryReader): Quaternion4D;
}

export namespace Quaternion4D {
  export type AsObject = {
    x: number,
    y: number,
    z: number,
    w: number,
  }
}

export class Pose extends jspb.Message {
  hasPosition(): boolean;
  clearPosition(): void;
  getPosition(): Vector3D | undefined;
  setPosition(value?: Vector3D): void;

  hasOrientation(): boolean;
  clearOrientation(): void;
  getOrientation(): Quaternion4D | undefined;
  setOrientation(value?: Quaternion4D): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Pose.AsObject;
  static toObject(includeInstance: boolean, msg: Pose): Pose.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Pose, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Pose;
  static deserializeBinaryFromReader(message: Pose, reader: jspb.BinaryReader): Pose;
}

export namespace Pose {
  export type AsObject = {
    position?: Vector3D.AsObject,
    orientation?: Quaternion4D.AsObject,
  }
}

export class Rig extends jspb.Message {
  hasRoot(): boolean;
  clearRoot(): void;
  getRoot(): Pose | undefined;
  setRoot(value?: Pose): void;

  hasHead(): boolean;
  clearHead(): void;
  getHead(): Pose | undefined;
  setHead(value?: Pose): void;

  hasLefthand(): boolean;
  clearLefthand(): void;
  getLefthand(): Pose | undefined;
  setLefthand(value?: Pose): void;

  hasRighthand(): boolean;
  clearRighthand(): void;
  getRighthand(): Pose | undefined;
  setRighthand(value?: Pose): void;

  hasHips(): boolean;
  clearHips(): void;
  getHips(): Pose | undefined;
  setHips(value?: Pose): void;

  hasLeftfoot(): boolean;
  clearLeftfoot(): void;
  getLeftfoot(): Pose | undefined;
  setLeftfoot(value?: Pose): void;

  hasRightfoot(): boolean;
  clearRightfoot(): void;
  getRightfoot(): Pose | undefined;
  setRightfoot(value?: Pose): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Rig.AsObject;
  static toObject(includeInstance: boolean, msg: Rig): Rig.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Rig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Rig;
  static deserializeBinaryFromReader(message: Rig, reader: jspb.BinaryReader): Rig;
}

export namespace Rig {
  export type AsObject = {
    root?: Pose.AsObject,
    head?: Pose.AsObject,
    lefthand?: Pose.AsObject,
    righthand?: Pose.AsObject,
    hips?: Pose.AsObject,
    leftfoot?: Pose.AsObject,
    rightfoot?: Pose.AsObject,
  }
}

export class PlayerState extends jspb.Message {
  getUsername(): string;
  setUsername(value: string): void;

  hasRig(): boolean;
  clearRig(): void;
  getRig(): Rig | undefined;
  setRig(value?: Rig): void;

  getAvatar(): AvatarMap[keyof AvatarMap];
  setAvatar(value: AvatarMap[keyof AvatarMap]): void;

  getAttackState(): AttackStateMap[keyof AttackStateMap];
  setAttackState(value: AttackStateMap[keyof AttackStateMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlayerState.AsObject;
  static toObject(includeInstance: boolean, msg: PlayerState): PlayerState.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlayerState, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlayerState;
  static deserializeBinaryFromReader(message: PlayerState, reader: jspb.BinaryReader): PlayerState;
}

export namespace PlayerState {
  export type AsObject = {
    username: string,
    rig?: Rig.AsObject,
    avatar: AvatarMap[keyof AvatarMap],
    attackState: AttackStateMap[keyof AttackStateMap],
  }
}

export class WorldState extends jspb.Message {
  clearPlayersList(): void;
  getPlayersList(): Array<PlayerState>;
  setPlayersList(value: Array<PlayerState>): void;
  addPlayers(value?: PlayerState, index?: number): PlayerState;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WorldState.AsObject;
  static toObject(includeInstance: boolean, msg: WorldState): WorldState.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WorldState, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WorldState;
  static deserializeBinaryFromReader(message: WorldState, reader: jspb.BinaryReader): WorldState;
}

export namespace WorldState {
  export type AsObject = {
    playersList: Array<PlayerState.AsObject>,
  }
}

export class WorldRequest extends jspb.Message {
  getSeed(): string;
  setSeed(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WorldRequest.AsObject;
  static toObject(includeInstance: boolean, msg: WorldRequest): WorldRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WorldRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WorldRequest;
  static deserializeBinaryFromReader(message: WorldRequest, reader: jspb.BinaryReader): WorldRequest;
}

export namespace WorldRequest {
  export type AsObject = {
    seed: string,
  }
}

export class World extends jspb.Message {
  clearTerrainList(): void;
  getTerrainList(): Array<number>;
  setTerrainList(value: Array<number>): void;
  addTerrain(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): World.AsObject;
  static toObject(includeInstance: boolean, msg: World): World.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: World, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): World;
  static deserializeBinaryFromReader(message: World, reader: jspb.BinaryReader): World;
}

export namespace World {
  export type AsObject = {
    terrainList: Array<number>,
  }
}

export interface AvatarMap {
  REIMU: 0;
  MARISA: 1;
}

export const Avatar: AvatarMap;

export interface AttackStateMap {
  NOT_ATTACKING: 0;
  ATTACKING: 1;
}

export const AttackState: AttackStateMap;

