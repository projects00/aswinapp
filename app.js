const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const connect = mysql.createPool({ 
   host:'mysql7002.site4now.net',
   user:'l9plltwp_project',
   password:'nandhu@123',
   database:'l9plltwp_projectdeal',
   native: true,
   pool: { maxConnections: 1000, maxIdleTime: 30 }
});
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
    next();
  });
  

connect.getConnection(err=>{
    if(err){
        console.log(err)
    }else{
        console.log("MySql Connected...")
    }
});


let createTodos = `create table if not exists bikeuser(
    id int primary key auto_increment,
    email varchar(255),
    password varchar(255),
    username varchar(255),
    dob varchar(255)
)`;



connect.query(createTodos,(err,result,fields)=>{
    if(err){
        console.log(err);
    }
})


// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/',(req,res)=>{

   return res.json("welcome to Aswin bike service api.")
})
app.post('/register',(req,res)=>{
    let query = "insert into bikeuser set ?"
    data = {
        id:null,
        email:req.body.email,
        password: bcrypt.hashSync(req.body.password,10),
        username:req.body.name,
        dob:req.body.dob
    }
  connect.getConnection((err,conn)=>{
    
      conn.query(query,data,(err,row)=>{
     
        return res.json({"inserted":true,"userid":row.insertId})
    })
  })
 

})



app.post('/checkuser',(req,res)=>{
    const query = "select * from bikeuser where email = ?";
 connect.getConnection((err,conn)=>{
     if(err){
         conn.release();
     }
     conn.query(query,[req.body.email],(err,data)=>{
        if(err){
            conn.release();
        }
        if(data.length == 0){
            return   res.json(false)
        }else{
            return res.json(true)
        }
    })
    conn.release();
 })


})
app.post('/login',(req,res)=>{
    const query = "select * from bikeuser where email = ?";
 connect.getConnection((err,conn)=>{
   
     
    conn.query(query,[req.body.email],(err,data)=>{
       
         if(data.length == 0){
           return res.json({message:"invalid credential"})
         }
         if(!bcrypt.compareSync(req.body.password,data[0].password)){
            
           return  res.json({message:"check your password"})
         }
  
        let token = jwt.sign({user:data},"secret",{expiresIn:7200})
      return res.json({message:"Logged in successfully",userid:data[0].id,token:token})
    })
conn.release(); 
 })
}) 

app.get('/user/:id',(req,res)=>{
    connect.getConnection((err,conn)=>{ 
        if(err){ 
            conn.release() 
        }
        let query ="select * from bikeuser WHERE id = ?";
      
        conn.query(query,[req.params.id],(err,data)=>{
            if(err){
                conn.release();
            }
            return  res.json(data[0])
        })
        conn.release();
    })
    })



const port = process.env.PORT || 5000;

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});