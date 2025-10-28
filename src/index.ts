import { Server } from "./Server/Server.ts";

const serverInstance: Server = Server.getInstance();
serverInstance.start();
