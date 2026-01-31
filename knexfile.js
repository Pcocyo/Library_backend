const Env = require("./dist/config/config").default;
const DB_URL = Env.getDB_URL();

const common = {
    client: 'pg',
    migrations: {
        directory: './db/migrations',
        extension: [".js",".mjs"]
    },
    seeds: {
        directory: './db/seeds'
    }
}

const development = {
    ...common,
    connection: {
        host: DB_URL.host,
        port: DB_URL.port,
        database: DB_URL.databaseName,
        user: DB_URL.user,
        password: DB_URL.password
    }
}
const test = {
    ...common,
    connection: {
        host: DB_URL.host,
        port: DB_URL.port,
        database: DB_URL.databaseName,
        user: DB_URL.user,
        password: DB_URL.password
    }
}
module.exports = {
    development,
    test
}

