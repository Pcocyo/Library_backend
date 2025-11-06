import { Server } from "./Server/Server";

const serverInstance: Server = Server.getInstance();
serverInstance.start();
