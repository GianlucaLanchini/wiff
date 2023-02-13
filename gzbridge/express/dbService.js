const mysql = require('mysql2');
const dotnev = require('dotenv');

dotnev.config({path: './express/.env'});

const db = mysql.createConnection({
    host: process.env.db_HOST,
    user: process.env.db_USER,
    password: process.env.db_PASSWORD,
    database: process.env.db_NAME,
    port: process.env.db_PORT
});

db.connect(error => {
    if(error){
        console.log('Error')
    } else {
        console.log('Database connected');
    }
})

module.exports = db;