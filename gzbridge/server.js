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
const instance = require('./express/instance');
const message = require('./express/messages')

const app = express();
app.use(cors());
app.use('/', diagram);
app.use('/', instance);
app.use('/', message);

/**
 * Path from where the static site is served
 */
const staticBasePath = './../http/client';

/**
 * Port to serve from
 */
const port = 8080;

/**
 * Array of websocket connections (counting only if gzserver is active) currently active,
 * if it is empty, there are no clients connected.
 */
let connections = [];

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
  else if (req.url === '/instances') {
    currentPage = 'instances';
    req.url = '/instances.html';
  }
  else if (req.url === '/' || req.url === '/?pp=1') {
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

  gzNode = undefined;

  isConnected = false;

  // Accept request
  let connection = request.accept(null, request.origin);

  if(currentPage == 'viewer') {
    
    gzNode = new gzbridge.GZNode();

    if (gzNode.getIsGzServerConnected()) {

      gzNode.loadMaterialScripts(staticBasePath + '/viewer/assets');
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

      connections.push(connection);
      isConnected = true;
      gzNode.setConnected(isConnected);

      console.log(new Date() + ' New connection accepted from: ' + request.origin +
          ' ' + connection.remoteAddress);

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

    // Handle messages received from client
    connection.on('message', function(message) {
      if(typeof gzNode !== 'undefined') {
        if (message.type === 'utf8') {
          console.log(new Date() + ' Received Message: ' + message.utf8Data +
              ' from ' + request.origin + ' ' + connection.remoteAddress);
          gzNode.request(message.utf8Data);
        }
        else if (message.type === 'binary') {
          console.log(new Date() + ' Received Binary Message of ' +
              message.binaryData.length + ' bytes from ' + request.origin + ' ' +
              connection.remoteAddress);
          connection.sendBytes(message.binaryData);
        }
      }
    });

    // Handle client disconnection
    connection.on('close', function(reasonCode, description) {
      if(typeof gzNode !== 'undefined') {
        console.log(new Date() + ' Peer ' + request.origin + ' ' +
            connection.remoteAddress + ' disconnected.');

        // remove connection from array
        let conIndex = connections.indexOf(connection);
        connections.splice(conIndex, 1);
        console.log('\n\n\n\n\n Chiusura Connessione \n\n\n\n\n\n\n')
        isConnected = false;
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
