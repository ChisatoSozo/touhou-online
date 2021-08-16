// package: touhou
// file: touhou.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as touhou_pb from "./touhou_pb";

interface ITouhouService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    playerStateUpdate: ITouhouService_IPlayerStateUpdate;
    worldUpdate: ITouhouService_IWorldUpdate;
}

interface ITouhouService_IPlayerStateUpdate extends grpc.MethodDefinition<touhou_pb.PlayerState, touhou_pb.Empty> {
    path: "/touhou.Touhou/PlayerStateUpdate";
    requestStream: true;
    responseStream: false;
    requestSerialize: grpc.serialize<touhou_pb.PlayerState>;
    requestDeserialize: grpc.deserialize<touhou_pb.PlayerState>;
    responseSerialize: grpc.serialize<touhou_pb.Empty>;
    responseDeserialize: grpc.deserialize<touhou_pb.Empty>;
}
interface ITouhouService_IWorldUpdate extends grpc.MethodDefinition<touhou_pb.Empty, touhou_pb.WorldState> {
    path: "/touhou.Touhou/WorldUpdate";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<touhou_pb.Empty>;
    requestDeserialize: grpc.deserialize<touhou_pb.Empty>;
    responseSerialize: grpc.serialize<touhou_pb.WorldState>;
    responseDeserialize: grpc.deserialize<touhou_pb.WorldState>;
}

export const TouhouService: ITouhouService;

export interface ITouhouServer {
    playerStateUpdate: grpc.handleClientStreamingCall<touhou_pb.PlayerState, touhou_pb.Empty>;
    worldUpdate: grpc.handleServerStreamingCall<touhou_pb.Empty, touhou_pb.WorldState>;
}

export interface ITouhouClient {
    playerStateUpdate(callback: (error: grpc.ServiceError | null, response: touhou_pb.Empty) => void): grpc.ClientWritableStream<touhou_pb.PlayerState>;
    playerStateUpdate(metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: touhou_pb.Empty) => void): grpc.ClientWritableStream<touhou_pb.PlayerState>;
    playerStateUpdate(options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: touhou_pb.Empty) => void): grpc.ClientWritableStream<touhou_pb.PlayerState>;
    playerStateUpdate(metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: touhou_pb.Empty) => void): grpc.ClientWritableStream<touhou_pb.PlayerState>;
    worldUpdate(request: touhou_pb.Empty, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<touhou_pb.WorldState>;
    worldUpdate(request: touhou_pb.Empty, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<touhou_pb.WorldState>;
}

export class TouhouClient extends grpc.Client implements ITouhouClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public playerStateUpdate(callback: (error: grpc.ServiceError | null, response: touhou_pb.Empty) => void): grpc.ClientWritableStream<touhou_pb.PlayerState>;
    public playerStateUpdate(metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: touhou_pb.Empty) => void): grpc.ClientWritableStream<touhou_pb.PlayerState>;
    public playerStateUpdate(options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: touhou_pb.Empty) => void): grpc.ClientWritableStream<touhou_pb.PlayerState>;
    public playerStateUpdate(metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: touhou_pb.Empty) => void): grpc.ClientWritableStream<touhou_pb.PlayerState>;
    public worldUpdate(request: touhou_pb.Empty, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<touhou_pb.WorldState>;
    public worldUpdate(request: touhou_pb.Empty, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<touhou_pb.WorldState>;
}
