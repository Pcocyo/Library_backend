import type { Application } from "express";
import { App } from "./AppInterface";
import express from 'express';
import helmet from "helmet";
import cors from "cors";

export class DevApp extends App {
    protected app: Application | null = null;
    private static instance: DevApp;

    private constructor() {
        super();
        this.app = this.setSettings(this.app);
    }

    protected setSettings(app: Application | null): Application {
        app = express();
        this.setMiddleware(app);
        return app;
    }

    private setMiddleware(app: Application): void {
        app.use(cors());
        app.use(helmet());
        app.use(express.json());
    }

    public static getInstance(): DevApp {
        if (!DevApp.instance) {
            DevApp.instance = new DevApp();
            return DevApp.instance;
        }
        else {
            return DevApp.instance;
        }
    }

    public getApp(): Application {
        if (!this.app) {
            throw new Error("Express is not initialized");
        }
        return this.app;
    }
}
