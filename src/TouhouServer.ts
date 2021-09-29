import fs from 'fs';
import { sendUnaryData, ServerUnaryCall, ServerWritableStream } from 'grpc';
import { PNG } from 'pngjs';
import { ITouhouServer } from './protos/touhou_grpc_pb';
import { PlayerState, World, WorldRequest, WorldState } from './protos/touhou_pb';
interface InternalWorldState {
    playerStates: { [username: string]: PlayerState };
}

//@ts-ignore
export class TouhouServer implements ITouhouServer {
    private worldState: InternalWorldState & { playerRecency: { [key: string]: Date } };

    constructor() {
        this.worldState = {
            playerStates: {},
            playerRecency: {},
        };

        setInterval(() => {
            const now = new Date();
            for (const username in this.worldState.playerRecency) {
                if (now.valueOf() - this.worldState.playerRecency[username].valueOf() > 1000) {
                    console.log(`${username} has left the game.`)
                    delete this.worldState.playerStates[username];
                    delete this.worldState.playerRecency[username];
                }
            }
        }, 10000);
    }

    playerStateUpdate(call): void {
        call.on('data', (playerState: PlayerState) => {
            const playerStateObj = playerState.toObject();
            if (!this.worldState.playerStates[playerStateObj.username]) {
                console.log(`${playerStateObj.username} has joined the game!`)
            }
            this.worldState.playerStates[playerStateObj.username] = playerState;
            this.worldState.playerRecency[playerStateObj.username] = new Date();
        });
    }

    worldUpdate(call: ServerWritableStream<WorldState>) {
        setInterval(() => {
            const playerStates = Object.values(this.worldState.playerStates);
            const worldState = new WorldState();
            worldState.setPlayersList(playerStates);
            call.write(worldState);
        }, 10);

        call.on('end', () => call.end());
    }

    worldDownload(call: ServerUnaryCall<WorldRequest>, callback: sendUnaryData<World>) {
        fs.createReadStream('C:/Users/Sara/Documents/touhou-online/height.png')
            .pipe(
                new PNG({
                    filterType: 4,
                }),
            )
            .on('parsed', function () {
                const array = [...this.data];
                const world = new World();
                world.setTerrainList(array);
                callback(null, world);
            });
    }
}
