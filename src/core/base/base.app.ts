import type { Application } from "express";

export abstract class BaseApp {
    protected abstract app: Application | null;

    protected abstract setSettings(app: Application | null): Application;
    public abstract getApp(): Application;
}
