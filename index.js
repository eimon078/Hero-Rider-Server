const express = require("express");
const app = express();
const { MongoClient } = require('mongodb');
const cors = require('cors')
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 7000;
const fileUpload = require('express-fileupload');


// middleware 
app.use(cors());
app.use(express.json());
app.use(fileUpload());

//connect MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nxj01.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        // console.log("connected");
        const database = client.db('Hero-Rider');
        const usersCollection = database.collection('users');

        //All user Api
        app.get('/user', async (req, res) => {
            const cursor = usersCollection.find({});
            const allOrders = await cursor.toArray();
            res.send(allOrders);

        })


        app.post('/user', async (req, res) => {
            let userdata = { ...req.body }
            for (const key in req.files) {
                let pic = req.files[key];
                let picData = pic.data
                let encodePic = picData.toString('base64');
                let imageBuffer = Buffer.from(encodePic, "base64");
                userdata = { ...userdata, [key]: imageBuffer }
            }
            console.log(userdata);
            const result = await usersCollection.insertOne(userdata);
            res.json(result);
        })

        //get  user role api
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
    }
    finally {
        // await client.close()
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("hello, I am from Hero Rider");
})

app.listen(port, () => {
    console.log("App lintening successfully");
})