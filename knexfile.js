import Env from './dist/Config/config.js'
const DB_URL = Env.getDB_URL();

const common = {
    client: 'pg',
    migrations: {
        directory: './db/migrations',
    },
    seeds: {
        directory: './db/seeds'
    }
}

export const development = {
    ...common,
    connection: {
        host: DB_URL.host,
        port: DB_URL.port,
        database: DB_URL.databaseName,
        user: DB_URL.user,
        password: DB_URL.password
    }
}
export const test = {
    ...common,
    connection: {
        host: DB_URL.host,
        port: DB_URL.port,
        database: DB_URL.databaseName,
        user: DB_URL.user,
        password: DB_URL.password
    }
}
