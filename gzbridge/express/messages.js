const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const db = require('./dbService');
const { type } = require('jquery');
const app = express();

app.use(cors());
app.use(bodyparser.json({limit: "50mb"}));
app.use(bodyparser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.get('/messages', (req,res)=>{
    db.query('select * from msgs', (err,result) => {
        result.forEach(function(e) {
            e.payload_msgs = JSON.parse(e.payload_msgs);
        })
        if(err){
            console.log('Error');
        }
        if(result){
            res.send({
                message: "Messages List",
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

app.get('/messages/:id', (req,res)=>{
    let ID = req.params.id
    db.query('select * from msgs where id_msgs = ?', [ID], (err,result) => {
        result[0].payload_msgs = JSON.parse(result[0].payload_msgs);
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

app.post('/messages', (req,res) => {
    let messageName = req.body.name_msgs;
    let messageCategory = req.body.cat_msgs;
    let messagePayload = JSON.stringify(req.body.payload_msgs);
    db.query('insert into msgs(name_msgs, cat_msgs, payload_msgs) values(?,?,?)', [messageName, messageCategory, messagePayload], (err, result) => {
        if(err){
            console.log('Error');
        }
        if(result){
            res.send({
                message: "Added message type",
                data: result
            })
        } 
    }) 
})

module.exports = app;