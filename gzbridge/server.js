#!/usr/bin/env node

"use strict"

const express = require('express');
const cors = require('cors');
const WebSocketServer = require('websocket').server;
const http = require('http');
const fs = require('fs');
const path = require('path');
const gzbridge = require('./build/Debug/gzbridge');
const diagram = require('./express/diagram');

const app = express();
app.use(cors());
app.use('/', diagram);

/**
 * Path from where the static site is served
 */
const staticBasePath = './../http/client';

/**
 * Port to serve from, defaults to 8080
 */
const port = 8080;

/**
 * Array of websocket connections currently active, if it is empty, there are no
 * clients connected.
 */
let connections = [];

/**
 * Holds the message containing all material scripts in case there is no
 * gzserver connected
 */
let materialScriptsMessage = {};

/**
 * Whether currently connected to a gzserver
 */
let isConnected = false;

let gzNode;

let currentPage = '';

/**
 * Callback to serve static files
 * @param req Request
 * @param res Response
 */
let staticServe = function(req, res) {

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');

  let fileLoc = path.resolve(staticBasePath);

  if (req.url === '/viewer') {
    currentPage = 'viewer';
    req.url = '/index.html';
  }
  else if (req.url === '/') {
    currentPage = 'modeler';
    req.url = '/modeler.html';
  } 

  fileLoc = path.join(fileLoc, req.url);

  fs.readFile(fileLoc, function(err, data) {
    if (err) {
        res.writeHead(404, 'Not Found');
        res.write('404: File Not Found!');
        return res.end();
    }

    res.statusCode = 200;

    res.write(data);
    return res.end();
  });
};

// HTTP server
let httpServer = http.createServer(staticServe);
httpServer.listen(port, () => {
  console.log(new Date() + " Static server listening on port: " + port);
});

app.listen(3000, () => {
  console.log('Server running ...');  
});


// Start websocket server
let wsServer = new WebSocketServer({
  httpServer: httpServer,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false
})

wsServer.on('request', function(request) {

  isConnected = false;

  // Accept request
  let connection = request.accept(null, request.origin);

  if(currentPage == 'viewer') {
    
    gzNode = new gzbridge.GZNode();

  if (gzNode.getIsGzServerConnected())
{
gzNode.loadMaterialScripts(staticBasePath + '/assets');
gzNode.setPoseMsgFilterMinimumAge(0.02);
gzNode.setPoseMsgFilterMinimumDistanceSquared(0.00001);
gzNode.setPoseMsgFilterMinimumQuaternionSquared(0.00001);

console.log('--------------------------------------------------------------');
console.log('Gazebo transport node connected to gzserver.');
console.log('Pose message filter parameters between successive messages: ');
console.log('  minimum seconds: ' +
gzNode.getPoseMsgFilterMinimumAge());
console.log('  minimum XYZ distance squared: ' +
gzNode.getPoseMsgFilterMinimumDistanceSquared());
console.log('  minimum Quartenion distance squared:'
+ ' ' + gzNode.getPoseMsgFilterMinimumQuaternionSquared());
console.log('--------------------------------------------------------------');
isConnected = true;
gzNode.setConnected(isConnected);
} else return;

  /*
  // If gzserver is not connected just send material scripts and status
  if (!gzNode.getIsGzServerConnected())
  {
    // create error status and send it
    let statusMessage =
        '{"op":"publish","topic":"~/status","msg":{"status":"error"}}';
    connection.sendUTF(statusMessage);
    // send material scripts message
    connection.sendUTF(materialScriptsMessage);
    return;
  }
  */

  connections.push(connection);

  console.log(new Date() + ' New connection accepted from: ' + request.origin +
      ' ' + connection.remoteAddress);

  // Handle messages received from client
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log(new Date() + ' Received Message: ' + message.utf8Data +
          ' from ' + request.origin + ' ' + connection.remoteAddress);
      if(typeof gzNode !== 'undefined') {
        gzNode.request(message.utf8Data);
      }
    }
    else if (message.type === 'binary') {
      console.log(new Date() + ' Received Binary Message of ' +
          message.binaryData.length + ' bytes from ' + request.origin + ' ' +
          connection.remoteAddress);
      connection.sendBytes(message.binaryData);
    }
  });

  // Handle client disconnection
  connection.on('close', function(reasonCode, description) {
    console.log(new Date() + ' Peer ' + request.origin + ' ' +
        connection.remoteAddress + ' disconnected.');

    // remove connection from array
    let conIndex = connections.indexOf(connection);
    connections.splice(conIndex, 1);
    console.log('\n\n\n\n\n Chiusura Connessione \n\n\n\n\n\n\n')
    isConnected = false;
    if(typeof gzNode !== 'undefined') {
      gzNode.setConnected(isConnected);
    }
  });
  }

});

// If not connected, periodically send messages
setInterval(update, 10);

function update() {
  if(isConnected) {
    if(typeof gzNode !== 'undefined') {
      if (connections.length > 0) {
        let msgs = gzNode.getMessages();
        for (let i = 0; i < connections.length; ++i) {
          for (let j = 0; j < msgs.length; ++j) {
            connections[i].sendUTF(msgs[j]);
          }
        }
      }
    }
  }
}
