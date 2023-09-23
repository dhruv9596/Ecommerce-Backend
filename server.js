const app = require('./app');

const dotenv = require('dotenv');

const connectDatabase = require('./config/database');

//Handling Uncaught Exception
//Ex : console.log(dhruv) where dhruv isn't defined.
process.on('uncaughtException', (err) => {
    console.log( `Error : ${err.message}`);
    console.log(`Shutting down  server due to uncaught exception `);
    process.exit(1);
})


//config

dotenv.config({ path : `backend/config/config.env`})

//connecting to DB 
connectDatabase()

const server = app.listen(process.env.PORT , () => {
    console.log(`Server Working on http://localhost : ${process.env.PORT}`);
})

//console.log(dhruv);

//Unhandled Promise Rejection when server crashes
//Ex : change mongodb to mongo in config.env
//In that case we shut down the server 
//preventing from insult

process.on('unhandledRejection', err => {
    console.log(`Error : ${err.message}`);
    console.log('Shutting Down Server due to unhandled promise rejection');

    server.close(() => {
        process.exit(1);
    })

})