const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const db = require('./dbService');
const app = express();

app.use(cors());
app.use(bodyparser.json({limit: "50mb"}));
app.use(bodyparser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.get('/instances', (req,res)=>{
    db.query('select * from instances', (err,result) => {
        if(err){
            console.log('Error');
        }
        if(result){
            res.send({
                message: "Instances List",
                data: result
            })
        } else {
            res.send({
                message: "No data found" 
            })
        }
    }
    );
})

app.get('/instances/:id', (req,res)=>{
    let ID = req.params.id
    db.query('select * from instances where id_instance = ?', [ID], (err,result) => {
        if(err){
            console.log('Error');
        }
        if(result){
            res.send({
                data: result
            })
        } else {
            res.send({
                message: "No data found" 
            }) 
        }
    });
})

module.exports = app;