import compression from "compression";
import cors from "cors";
import express, { Application } from "express";
import { createServer, Server as HTTPServer } from "http";
import { Image } from 'image-js';
import path from "path";
import socketIO, { Server as SocketIOServer } from "socket.io";

const version = 'height_new.png'

export class Server {
  private httpServer: HTTPServer;
  private app: Application;
  private io: SocketIOServer;

  private activeSockets: string[] = [];
  private terrainHeightArray?: Uint16Array;

  private readonly DEFAULT_PORT = 5000;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    let image = await Image.load(path.join(__dirname, `resources/${version}`));
    this.terrainHeightArray = new Uint16Array(image.width * image.height);
    for (let i = 0; i < image.width; i++) {
      for (let j = 0; j < image.height; j++) {
        this.terrainHeightArray[i * image.height + j] = image.getPixelXY(i, j)[0];
      }
    }
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = socketIO(this.httpServer);

    this.configureApp();
    this.configureRoutes();
    this.handleSocketConnection();
    this.listen((port) => {
      console.log(`Server is listening on http://localhost:${port}`);
    });
  }

  private configureApp(): void {
    this.app.use(compression())
    this.app.use(cors())
    this.app.use(express.static(path.join(__dirname, "../public")));
  }

  private configureRoutes(): void {
    this.app.get("/terrain", async (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': this.terrainHeightArray.buffer.byteLength
      });
      res.end(Buffer.from(this.terrainHeightArray.buffer));
    });
    this.app.get("/terrainVersion", async (req, res) => {
      res.json({ version })
    });
  }

  private handleSocketConnection(): void {
    this.io.on("connection", socket => {
      const existingSocket = this.activeSockets.find(
        existingSocket => existingSocket === socket.id
      );

      if (!existingSocket) {
        this.activeSockets.push(socket.id);

        socket.emit("update-user-list", {
          users: this.activeSockets.filter(
            existingSocket => existingSocket !== socket.id
          )
        });

        socket.broadcast.emit("update-user-list", {
          users: [socket.id]
        });
      }

      socket.on("call-user", (data: any) => {
        socket.to(data.to).emit("call-made", {
          offer: data.offer,
          socket: socket.id
        });
      });

      socket.on("make-answer", data => {
        socket.to(data.to).emit("answer-made", {
          socket: socket.id,
          answer: data.answer
        });
      });

      socket.on("reject-call", data => {
        socket.to(data.from).emit("call-rejected", {
          socket: socket.id
        });
      });

      socket.on("disconnect", () => {
        this.activeSockets = this.activeSockets.filter(
          existingSocket => existingSocket !== socket.id
        );
        socket.broadcast.emit("remove-user", {
          socketId: socket.id
        });
      });
    });
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, () => {
      callback(this.DEFAULT_PORT);
    });
  }
}
