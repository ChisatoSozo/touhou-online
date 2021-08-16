// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var touhou_pb = require('./touhou_pb.js');

function serialize_touhou_Empty(arg) {
  if (!(arg instanceof touhou_pb.Empty)) {
    throw new Error('Expected argument of type touhou.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_touhou_Empty(buffer_arg) {
  return touhou_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_touhou_PlayerState(arg) {
  if (!(arg instanceof touhou_pb.PlayerState)) {
    throw new Error('Expected argument of type touhou.PlayerState');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_touhou_PlayerState(buffer_arg) {
  return touhou_pb.PlayerState.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_touhou_World(arg) {
  if (!(arg instanceof touhou_pb.World)) {
    throw new Error('Expected argument of type touhou.World');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_touhou_World(buffer_arg) {
  return touhou_pb.World.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_touhou_WorldRequest(arg) {
  if (!(arg instanceof touhou_pb.WorldRequest)) {
    throw new Error('Expected argument of type touhou.WorldRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_touhou_WorldRequest(buffer_arg) {
  return touhou_pb.WorldRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_touhou_WorldState(arg) {
  if (!(arg instanceof touhou_pb.WorldState)) {
    throw new Error('Expected argument of type touhou.WorldState');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_touhou_WorldState(buffer_arg) {
  return touhou_pb.WorldState.deserializeBinary(new Uint8Array(buffer_arg));
}


var TouhouService = exports.TouhouService = {
  playerStateUpdate: {
    path: '/touhou.Touhou/PlayerStateUpdate',
    requestStream: true,
    responseStream: false,
    requestType: touhou_pb.PlayerState,
    responseType: touhou_pb.Empty,
    requestSerialize: serialize_touhou_PlayerState,
    requestDeserialize: deserialize_touhou_PlayerState,
    responseSerialize: serialize_touhou_Empty,
    responseDeserialize: deserialize_touhou_Empty,
  },
  worldUpdate: {
    path: '/touhou.Touhou/WorldUpdate',
    requestStream: false,
    responseStream: true,
    requestType: touhou_pb.Empty,
    responseType: touhou_pb.WorldState,
    requestSerialize: serialize_touhou_Empty,
    requestDeserialize: deserialize_touhou_Empty,
    responseSerialize: serialize_touhou_WorldState,
    responseDeserialize: deserialize_touhou_WorldState,
  },
  worldDownload: {
    path: '/touhou.Touhou/WorldDownload',
    requestStream: false,
    responseStream: false,
    requestType: touhou_pb.WorldRequest,
    responseType: touhou_pb.World,
    requestSerialize: serialize_touhou_WorldRequest,
    requestDeserialize: deserialize_touhou_WorldRequest,
    responseSerialize: serialize_touhou_World,
    responseDeserialize: deserialize_touhou_World,
  },
};

exports.TouhouClient = grpc.makeGenericClientConstructor(TouhouService);
