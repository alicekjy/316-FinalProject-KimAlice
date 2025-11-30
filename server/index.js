// THESE ARE NODE APIs WE WISH TO USE
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

// CREATE OUR SERVER
dotenv.config()
const PORT = process.env.PORT || 4000;
const app = express()

// SETUP THE MIDDLEWARE
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
const authRouter = require('./routes/auth-router')
app.use('/auth', authRouter)
const storeRouter = require('./routes/store-router')
app.use('/store', storeRouter)

// INITIALIZE OUR DATABASE OBJECT
const dbManager = require('./db/loader')
app.locals.db = dbManager;
// PUT THE SERVER IN LISTENING MODE
dbManager.connect().then(()=>{
    console.log('Database connected successfully.');
    const serverInstance = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    });
    serverInstance.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Stop the existing process or update PORT in the environment configuration.`);
        } else {
            console.error('Server failed to start:', error);
        }
        process.exit(1);
    });
}).catch(err => {
    console.error('Database connection failed: ', err);
    process.exit(1);
})
