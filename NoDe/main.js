require('dotenv').config({path: './.env'});

const express = require("express"), app = express();;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors')
const session = require("express-session");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(session({
    secret: 'pepito', //change
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 60 * 24,
    }
}));

try{
    mongoose.connect(process.env.DB_CONN_STRING);
}
catch(error){console.log("--- MONGO ERROR ---"); console.log(error);}

mongoose.connection.on("connected", function(){console.log("Connected to DB", mongoose.connection.readyState)});
//stupid idea should refine later
/*mongoose.connection.on("disconnected", async function()
{
    do
    {
        if(mongoose.connection.readyState == 0) await mongoose.connect(process.env.DB_CONN_STRING);
    }while(mongoose.connection.readyState != 1);
})*/ 

//ROUTES
const authRoutes = require('./routes/auth');
const ytRoutes = require('./routes/youtube');
const sRoutes = require('./routes/spotify');

app.use('/auth', authRoutes);
app.use('/s', sRoutes);
app.use('/yt', ytRoutes);

const port = process.env.PORT;
app.listen(port, () => {console.log();
    console.log(`Server is running on port ${port}`);
});
