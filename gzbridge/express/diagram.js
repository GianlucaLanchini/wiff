const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const db = require('./dbService');
const app = express();

const fs = require ('fs');

app.use(cors());
app.use(bodyparser.json());

app.get('/diagrams', (req,res)=>{
    db.query('select * from diagrams', (err,result) => {
        if(err){
            console.log('Error');
        }
        if(result){
            res.send({
                message: "Diagram List",
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

app.get('/diagrams/:id', (req,res)=>{
    let ID = req.params.id
    db.query('select * from diagrams where id_diagram = ?', [ID], (err,result) => {
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

app.post('/diagrams', (req,res) => {
    let diagramName = req.body.name_diagram;
    let diagramContent = req.body.content_diagram;
    let isCallActivity = req.body.is_call_activity;
    db.query('insert into diagrams(name_diagram, content_diagram, is_call_activity) values(?,?,?)', [diagramName, diagramContent, isCallActivity], (err, result) => {
        if(err){
            console.log('Error');
        }
        if(result){
            res.send({
                message: "Added diagram",
                data: result
            })
        } 
    }) 
})




module.exports = app;