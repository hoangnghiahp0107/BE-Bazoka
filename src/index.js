import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
const app = express();
dotenv.config();
app.use(cors()); 
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(express.static("."))


app.listen(8080); 

app.post("/receive-hook", async(req,res) =>{
    console.log(req.body);
    res.json();
});

import rootRoutes from './Routes/rootRoutes.js';

app.use("/api",rootRoutes)



