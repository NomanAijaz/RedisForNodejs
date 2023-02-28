const express = require('express'); 
const Redis = require('redis') // import redis
const axios = require('axios');

const app = express();
const redisClient = Redis.createClient()
const ExpTime=100;


app.use('/test', async (request, response)=>{
    await redisClient.connect();
    const {randomKey} = request.query
    const data  = await redisClient.get(`data-${randomKey}`)
    
    if(!data){
        console.log("API Hit");
        data = await axios.get('https://pokeapi.co/api/v2/pokemon/2/')
        redisClient.setEx(`data-${randomKey}`,ExpTime, JSON.stringify(data))
    }else{
        console.log("Redis Hit");
    }    
    await redisClient.disconnect();
    return response.status(200).json({
        msg:'Success',
        data
    })
})

app.use('/', async (request, response)=>{
    await redisClient.connect();
    redisClient.FLUSHALL('ASYNC', (callback)=>{
        console.log("Redis FLUSH ALL!!");
    });
    await redisClient.disconnect();
    return response.status(200).json({
        msg:'FLUSH ALL',
        data:[]
    })
})

const PORT =3000;
app.listen(PORT, ()=>{
    console.log(`App is Running on ${PORT} Port`)
})
