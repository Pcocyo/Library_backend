import { Server } from "./server/server";
const serverInstance: Server = Server.getInstance();
serverInstance.start();
