import  Server  from "./server/server";
import  AppConfig  from "./config/app.config";

const server: Server = Server.create(new AppConfig());
server.start();
