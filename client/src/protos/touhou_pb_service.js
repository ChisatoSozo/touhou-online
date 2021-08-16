// package: touhou
// file: touhou.proto

var touhou_pb = require("./touhou_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Touhou = (function () {
  function Touhou() {}
  Touhou.serviceName = "touhou.Touhou";
  return Touhou;
}());

Touhou.PlayerStateUpdate = {
  methodName: "PlayerStateUpdate",
  service: Touhou,
  requestStream: true,
  responseStream: false,
  requestType: touhou_pb.PlayerState,
  responseType: touhou_pb.Empty
};

Touhou.WorldUpdate = {
  methodName: "WorldUpdate",
  service: Touhou,
  requestStream: false,
  responseStream: true,
  requestType: touhou_pb.Empty,
  responseType: touhou_pb.WorldState
};

Touhou.WorldDownload = {
  methodName: "WorldDownload",
  service: Touhou,
  requestStream: false,
  responseStream: false,
  requestType: touhou_pb.WorldRequest,
  responseType: touhou_pb.World
};

exports.Touhou = Touhou;

function TouhouClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

TouhouClient.prototype.playerStateUpdate = function playerStateUpdate(metadata) {
  var listeners = {
    end: [],
    status: []
  };
  var client = grpc.client(Touhou.PlayerStateUpdate, {
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport
  });
  client.onEnd(function (status, statusMessage, trailers) {
    listeners.status.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners.end.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners = null;
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    write: function (requestMessage) {
      if (!client.started) {
        client.start(metadata);
      }
      client.send(requestMessage);
      return this;
    },
    end: function () {
      client.finishSend();
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

TouhouClient.prototype.worldUpdate = function worldUpdate(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Touhou.WorldUpdate, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

TouhouClient.prototype.worldDownload = function worldDownload(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Touhou.WorldDownload, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.TouhouClient = TouhouClient;

