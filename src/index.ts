import { Server } from "./Server/Server.js";

const serverInstance: Server = Server.getInstance();
serverInstance.start();
