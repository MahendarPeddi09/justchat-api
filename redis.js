const redis = require('redis')
const redisClient = redis.createClient(6363)
let resu = undefined
redisClient.on('ready',() =>{
    console.log("Redis Listening");
})
redisClient.on('error',(err) =>{
    console.log("issues with redis server",err);
})

const redisServices = {
    addNewConnection : (key,value) =>{
        redisClient.sadd([key,value],(err,reply) =>{
            console.log(err,reply)
        })
    },
    getSession : (key) =>{
        console.log("--",key)
        return new Promise((resolve,reject) =>{
         redisClient.smembers(key,(err,reply) =>{
             if (err) reject("messagenot pushed",err);
             else {
                 //console.log("listof:_redis:",reply)
                resolve(reply)
             }
         })
         
    })
        

    },
    removeSession : (key,value) =>{
        redisClient.srem([key,value],(err,reply) =>{
            console.log(err,reply)
        })
    }

}
module.exports = {
    _redis : redisServices,
    res : resu,
}

