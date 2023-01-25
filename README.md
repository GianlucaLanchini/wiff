<p align="left">
  <img src="./assets/wiff-logo.png" width="250px">
</p>

# wiff - Web Interface for FaMe

Web application for the visualization of the execution of the FaMe (https://pros.unicam.it/fame/) framework.

Built combining technologies from both Gzweb (https://github.com/osrf/gzweb), for the 3d visualization of the running FaMe simulation, and bpmn-js-token-simulation (https://github.com/bpmn-io/bpmn-js-token-simulation), for the visualization of the BPMN diagram and of its running tokens.

## Prerequisites

- Node.js (version 16.18.0)
- ROS2 Humble Hawksbill
- Gazebo
- All the requirements needed for Gzweb (http://classic.gazebosim.org/tutorials?tut=gzweb_install&cat=gzweb)

## Building

Build the gzweb part (Warning: it'll download all the gazebo models locally, it may take some minutes):

```sh
source /usr/share/gazebo/setup.sh
npm run deploy --- -m
```

Then build the bpmnjs part:

```sh
npm run bundle
```

## Running

To run the application you first need to launch the FaMe simulation package on the same machine where Wiff is installed.

The application also requires the rosbridge_server package launched on the same machine where the FaMe Engine package will be executed:

```sh
ros2 launch rosbridge_server rosbridge_websocket_launch.xml
```

Then start the application with:

```sh
npm start
```

You can access the application by accessing 'localhost:8080' on your preferred browser.

The access will prompt a request for the address where the rosbridge_server package was launched.
It will be ’ws://localhost:9090’, if the server is launched locally, or ’ws://*ip_address*:9090’, if it is launched on another machine.

The final step is to start the FaMe Engine package and watch the simulation running.