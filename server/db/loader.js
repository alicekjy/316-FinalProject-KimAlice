//database loader for loading appropriate database manager based on .env configuration
const dotenv = require('dotenv');
dotenv.config();

function createDatabaseManager(){
    const dbType = process.env.DATABASE_TYPE || 'mongodb';
    console.log(`Database Manager:  ${dbType}`);

    if(dbType ==='mongodb'){
        const MongoDBManger = require ('./mongodb/index');
        return new MongoDBManger();
    }else{
        throw new Error('Unsupported database type');
    }
}
const dbManager = createDatabaseManager();
module.exports = dbManager; 