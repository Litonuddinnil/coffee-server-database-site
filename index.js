const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

 //middleWare
app.use(cors());
app.use(express.json()); 

console.log(process.env.DB_UserName);
console.log(process.env.DB_Pass);


const uri = `mongodb+srv://${process.env.DB_UserName}:${process.env.DB_Pass}@cluster0.jc89u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
 
 

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const coffeeCollection = client.db("coffeeDb").collection("coffee");
    const userCollection = client.db('coffeeDb').collection("users");

    app.get('/coffee', async(req,res)=>{
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    //update
    app.get('/coffee/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id:new ObjectId(id)};
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    })
 //update single id
    app.put('/coffee/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updateCoffee = req.body;
      const coffee ={
        $set:{
          category:updateCoffee.category,
          details:updateCoffee.details,
          name:updateCoffee.name,
          photo:updateCoffee.photo,
          quantity:updateCoffee.quantity,
          supplier:updateCoffee.supplier,
          taste:updateCoffee.taste
        }
      }
      const result = await coffeeCollection.updateOne(filter,coffee,options);
      res.send(result);
    })

    app.post('/coffee', async(req,res)=>{
        const newCoffee = req.body;
        const result = await coffeeCollection.insertOne(newCoffee);
        res.send(result);
        console.log(newCoffee);
        
    });

    app.delete('/coffee/:id',async (req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    //User related apis
    app.get('/users',async(req,res)=>{
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/users/:email', async(req,res)=>{
      const email = req.params.email;
      const query = {email:email};
      const result = await userCollection.findOne(query);
      res.send(result);
    })
    app.post('/users', async(req,res)=>{
      const newUser = req.body;
      console.log('create a new user',newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    })
    app.put('/users/:email',async(req,res)=>{
      const email = req.params.email;
      const filter = {email:email};
      const options = { upsert: true };
      const updateUser = req.body;
      const user ={
        $set:{
          name:updateUser.name,
          photo:updateUser.photo,
          email:updateUser.email, 
        }
      }
      const result = await  userCollection.updateOne(filter,user,options);
      res.send(result);
    })
     
    app.delete('/users/:email',async(req,res)=>{
      const email = req.params.email;
      const query = {email: email};
      const result = await userCollection.deleteOne(query);
      res.send(result); 
    });

    //singIn method patch
    app.patch('/users', async(req,res)=>{
      const email = req.body.email;
      const query = {email};
      const updateDoc = {
        $set:{
          lastSignInTime:req.body?.lastSignInTime
        }
      }
      const result = await userCollection.updateOne(query,updateDoc);
      res.send(result);
    })
  
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send("Coffee making server is running");
});

app.listen(port,()=>{
    console.log(`coffee server is running port:${port}`);
})