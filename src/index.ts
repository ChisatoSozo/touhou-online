import grpc from 'grpc';
import { TouhouService } from './protos/touhou_grpc_pb';
import { Server } from './server';
import { TouhouServer } from './TouhouServer';

const server = new Server();

server.listen((port) => {
    console.log(`Server is listening on http://localhost:${port}`);
});

const touhouServer = new grpc.Server();

touhouServer.addService(TouhouService, new TouhouServer());
touhouServer.bindAsync(`localhost:4000`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        throw err;
    }
    console.log(`Listening on ${port}`);
    touhouServer.start();
});
