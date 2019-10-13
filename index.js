'use strict';
const express = require('express')
const jwt = require('jsonwebtoken')
const app = express();


const port = 7000;
const fs = require('fs');
const validateToken = require('./config/validatetoken')
const fetch = require('node-fetch')
var bodyParser = require('body-parser')
const cors = require('cors');
const cookieparser = require('cookie-parser')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({type: ['application/json','json']}));
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(cookieparser())

const server = app.listen(port, () =>console.log(`node js server started on ${port}`))
const io = require('socket.io')(server);
//io.attach(server,{cookie : false})

const ws = require('./websocketHandler')(io);

const contacts = [
    {
        "id" : 1,
        "name" : "user1",
        "msg" : "latest message",
        "timestamp" : 12433324
    },
    {
        "id" : 2,
        "name" : "user2",
        "msg" : "latest message",
        "timestamp" : 12433324
    },
    {
        "id" : 3,
        "name" : "user3",
        "msg" : "latest message",
        "timestamp" : 12433324
    },
    {
        "id" : 4,
        "name" : "user3",
        "msg" : "latest message",
        "timestamp" : 12433324
    }
]
const clients = []
const base_url = "http://localhost:9119/justchat"
//web sockets


var val = true

app.post('/recentChats',(req,res) =>{
let persons = [13,15,17]
let chats = []
let {owner:ownerId, friend:friendId} = req.body
console.log(req.body, typeof req.body,ownerId,friendId)
async function getRecentChats(o,f){
    

    res.contentType("application/json")
    let response = await fetch(`http://localhost:9119/justchat/chats/${o}/${f}`);
    let data = await response.json()

    return data;
}
//console.log(req.body)
getRecentChats(ownerId,friendId).then(data =>{
    // res.send("data")
    res.json(data)
})
})

app.post('/test',(req,res)=>{
    console.log(req.body)
res.contentType('json')
res.json(contacts)

})
app.post('/login',(req,res) =>{
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    //console.log('entered',req.cookies)
    
        if(req.body.userName && req.body.userPassword){
            async function login(){
                
                res.contentType("application/json")
                let response = await fetch(`http://localhost:9119/justchat/login`,{
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body:JSON.stringify(req.body)
                });
                let data = await response.json()
                //console.log("data: ",data)
               return data; 
            }
            //console.log(req.body)
            login().then(data =>{
                //console.log("--",data)
                let tokn = validateToken.getToken(data.userName,data.personId)
                //ws.getWsConnection();
                res.cookie('jc_jwt', {name:req.body.userName,userId:data.personId,id : tokn}, {httpOnly : true});
                
                res.json(data)
                //res.redirect("/");
                //
            }).catch(err => console.log(err));
        }else{
           res.json(JSON.stringify({'login' : 'failed'}))
       }
    
    
    
});
app.get('/session',(req,res) =>{
    //res.json(JSON.stringify({cookie : req.cookies.jc_jwt}))
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    if(req.cookies.jc_jwt){
        let token = req.cookies.jc_jwt;
        let session_name = token.name;
        let user_id = token.userId;
        let session_id = token.id;
        if(session_id && session_id !== ''){
            let validity = validateToken.validate(session_id);
                //console.log("=",validity.authorized)
                if(validity.authorized){
                    console.log("user token valid")
                    ws.getWsConnection(true,session_name,session_id,user_id);
                    //console.log(validity);
                }else{
                    res.json(JSON.stringify({'session':"token is corrupted"}));
                }
        }
        res.json(JSON.stringify({session:"valid",userName : session_name,userId:user_id,sessionId : session_id}));
    }
    else{
        
        res.json(JSON.stringify({'session':"invalid"}));
    }
    
 //   console.log(req.headers)
    //console.log("session cookies:",req.cookies)
    

})
app.get('/logout',(req,res) =>{
    
    if(req.cookie.jc_jwt && req.cookie.jc_jwt != ''){

    }
    res.sendStatus(200)
    
});
app.get('/',(req,res)=>{
    res.contentType('html')
    
    res.sendFile(__dirname+'/public/index.html');
    
    })



