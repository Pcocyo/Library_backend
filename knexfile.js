require("dotenv").config({quiet:true});

const common = {
    client: "pg",
    migrations: {
        directory: "./db/migrations",
        extension: "js",
    },
    seeds: {
        directory: "./db/seeds",
    },
};

const development = {
    ...common,
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
};
const test = {
    ...common,
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
};
module.exports = {
    development,
    test,
};
