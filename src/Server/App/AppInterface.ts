import type { Application } from "express";

export abstract class App {
    protected abstract app: Application | null;

    protected abstract setSettings(app: Application | null): Application;
    public abstract getApp(): Application;
}
