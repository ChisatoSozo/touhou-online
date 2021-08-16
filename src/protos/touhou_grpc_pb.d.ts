// GENERATED CODE -- DO NOT EDIT!

// package: touhou
// file: touhou.proto

import * as touhou_pb from "./touhou_pb";
import * as grpc from "grpc";

interface ITouhouService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  playerStateUpdate: grpc.MethodDefinition<touhou_pb.PlayerState, touhou_pb.Empty>;
  worldUpdate: grpc.MethodDefinition<touhou_pb.Empty, touhou_pb.WorldState>;
  worldDownload: grpc.MethodDefinition<touhou_pb.WorldRequest, touhou_pb.World>;
}

export const TouhouService: ITouhouService;

export interface ITouhouServer extends grpc.UntypedServiceImplementation {
  playerStateUpdate: grpc.handleClientStreamingCall<touhou_pb.PlayerState, touhou_pb.Empty>;
  worldUpdate: grpc.handleServerStreamingCall<touhou_pb.Empty, touhou_pb.WorldState>;
  worldDownload: grpc.handleUnaryCall<touhou_pb.WorldRequest, touhou_pb.World>;
}

export class TouhouClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  playerStateUpdate(callback: grpc.requestCallback<touhou_pb.Empty>): grpc.ClientWritableStream<touhou_pb.PlayerState>;
  playerStateUpdate(metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<touhou_pb.Empty>): grpc.ClientWritableStream<touhou_pb.PlayerState>;
  playerStateUpdate(metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<touhou_pb.Empty>): grpc.ClientWritableStream<touhou_pb.PlayerState>;
  worldUpdate(argument: touhou_pb.Empty, metadataOrOptions?: grpc.Metadata | grpc.CallOptions | null): grpc.ClientReadableStream<touhou_pb.WorldState>;
  worldUpdate(argument: touhou_pb.Empty, metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null): grpc.ClientReadableStream<touhou_pb.WorldState>;
  worldDownload(argument: touhou_pb.WorldRequest, callback: grpc.requestCallback<touhou_pb.World>): grpc.ClientUnaryCall;
  worldDownload(argument: touhou_pb.WorldRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<touhou_pb.World>): grpc.ClientUnaryCall;
  worldDownload(argument: touhou_pb.WorldRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<touhou_pb.World>): grpc.ClientUnaryCall;
}
