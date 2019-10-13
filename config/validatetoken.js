const jwt = require('jsonwebtoken')
const key = require('./secret.js')

validatelogin = (token) =>{
    //console.log("validtokent",token,key.secret_key)
   var re =  jwt.verify(token, key.secret_key,(err,decoded) =>{

        if(err) {
            console.log("error,",err)
            return {
                authorized : false,
                message : 'token is invalid'
            }
        }else{
           // console.log('----',decoded)
            return {
                authorized : true,
                message : 'valid token'
            }
            
        }
    })
    
    console.log("end",re)
    return re;
}
generatetoken = (name,id) =>{
    let token = jwt.sign({userName : name,userId : id}, key.secret_key,{});
    return token
};


module.exports ={
    validate : validatelogin,
    getToken : generatetoken,
}