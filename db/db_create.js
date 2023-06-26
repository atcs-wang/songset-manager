const mysql = require('mysql2');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || "10000"),
    multipleStatements: true // somewhat dangerous
}

const connection = mysql.createConnection(dbConfig);
//only query allows multiple statements, not execute
connection.query(fs.readFileSync(__dirname + "/db_drop.sql", {encoding : "UTF-8"}));
connection.query(fs.readFileSync(__dirname + "/db_create.sql", {encoding : "UTF-8"}));
connection.end();