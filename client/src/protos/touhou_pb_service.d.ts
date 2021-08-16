// package: touhou
// file: touhou.proto

import * as touhou_pb from "./touhou_pb";
import {grpc} from "@improbable-eng/grpc-web";

type TouhouPlayerStateUpdate = {
  readonly methodName: string;
  readonly service: typeof Touhou;
  readonly requestStream: true;
  readonly responseStream: false;
  readonly requestType: typeof touhou_pb.PlayerState;
  readonly responseType: typeof touhou_pb.Empty;
};

type TouhouWorldUpdate = {
  readonly methodName: string;
  readonly service: typeof Touhou;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof touhou_pb.Empty;
  readonly responseType: typeof touhou_pb.WorldState;
};

type TouhouWorldDownload = {
  readonly methodName: string;
  readonly service: typeof Touhou;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof touhou_pb.WorldRequest;
  readonly responseType: typeof touhou_pb.World;
};

export class Touhou {
  static readonly serviceName: string;
  static readonly PlayerStateUpdate: TouhouPlayerStateUpdate;
  static readonly WorldUpdate: TouhouWorldUpdate;
  static readonly WorldDownload: TouhouWorldDownload;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class TouhouClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  playerStateUpdate(metadata?: grpc.Metadata): RequestStream<touhou_pb.PlayerState>;
  worldUpdate(requestMessage: touhou_pb.Empty, metadata?: grpc.Metadata): ResponseStream<touhou_pb.WorldState>;
  worldDownload(
    requestMessage: touhou_pb.WorldRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: touhou_pb.World|null) => void
  ): UnaryResponse;
  worldDownload(
    requestMessage: touhou_pb.WorldRequest,
    callback: (error: ServiceError|null, responseMessage: touhou_pb.World|null) => void
  ): UnaryResponse;
}

