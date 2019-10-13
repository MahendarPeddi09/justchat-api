'use strict';
const fetch = require('node-fetch')
const _redis = require('./redis')._redis;


module.exports = function(io){
    console.log(typeof io)
    var Wss= {}
    Wss.getWsConnection = function(val,session_name,session_id,owner_id){

    if(val){
        io.sockets.once('connection', (socket) =>{
                    
                console.log('connection established',socket.id)
                _redis.addNewConnection(owner_id,socket.id);
                    
                async function getUserAsync(){
                    let response = await fetch(`http://localhost:9119/justchat/friends/${owner_id}`);
                    let data = await response.json()
                    return data;
                }
                getUserAsync()
                .then(data => {
                    console.log("sending allcontacts ",socket.id);
                    io.sockets.connected[socket.id].emit('allcontactsList',JSON.stringify(data))
                });
                async function getUserActiveAsync(){
                    let response = await fetch(`http://localhost:9119/justchat/friends/active/${owner_id}`);
                    let data = await response.json()
                    return data;
                }
                getUserActiveAsync()
                .then(data => {
                //  console.log(data);
                    io.sockets.connected[socket.id].emit('contactsList',JSON.stringify(data))
                });
                let sender_list = undefined
            socket.on('message', message =>{
                console.log("msg1:",message.to_id)
                
                console.log("msg2:","sending message")
                async function getUserHandleMessage(){
                    let response = await fetch('http://localhost:9119/justchat/m',{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },body: JSON.stringify(message)});
                    
                        
                    console.log("msg3:","senderlist:")
                    let data = await response.json()
                    console.log("msg4:","saving to redis",message)
                    let prom_list = await _redis.getSession(message.to_id);
                    sender_list = prom_list
                    

                    return data;
                };
                getUserHandleMessage()
                .then(data => {
                    console.log(typeof data,data.size,data)
                    io.sockets.connected[socket.id].emit('message',JSON.stringify(data))
                     if(!sender_list || sender_list === '' || sender_list === null){

                     }
                     else{
                        console.log("msg6:","mes",socket.id,data,sender_list)
                        
                    //io.sockets.connected[socket.id].emit('message',JSON.stringify(data));

                    sender_list.forEach((sess) =>{
                        console.log("msg7:","each session",sess);
                        
                        //io.sockets.connected[sess].emit('message',JSON.stringify(data));
                        io.to(sess).emit('message',JSON.stringify(data))
                    })
                }
                
                }).catch(err =>
                    console.log("senfMessage:",err));  
            
            });

            socket.on("typing",(ids)=>{
                
                console.log(ids)
                let [from_id,to_id] = [...ids]
                console.log(from_id,to_id)
                async function a(t){
                    console.log("typing:",t)
                    return await _redis.getSession(t);
                    

                };
                a(to_id).then(_data =>{
                    if(!_data || _data === '' || _data === null){
                        
                    }
                    else{
                    _data.forEach((sess1) =>{
                        //console.log("msg11:","each session",sess1)
                        //io.sockets.connected[sess].emit('typing',from_id);
                        //console.log(sess1,io.sockets.connected[sess1])
                        //io.sockets.connected[sess1].emit('tryping',JSON.stringify(from_id));
                        io.to(sess1).emit('tryping',JSON.stringify(from_id));
                    })
                    }
                }).catch(err =>{
                    console.log(err)
                })

            })
            socket.on('disconnect', function(){
                socket.disconnect(true);
                _redis.removeSession(owner_id,socket.id)
                console.info('disconnected user (id=' + socket.id + ').');
            });
                
                
                })
        }
    
    } 
Wss.closeConn = function(){
        
}
return Wss;
}
