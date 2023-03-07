const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const db = require('./dbService');
const app = express();

app.use(cors());
app.use(bodyparser.json({limit: "50mb"}));
app.use(bodyparser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

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

app.get('/callActivities', (req,res)=>{
    db.query('select * from diagrams where is_call_activity = 1', (err,result) => {
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