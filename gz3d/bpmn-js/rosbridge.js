function openRosConnection(address) {

  const ros = new ROSLIB.Ros({ url: address });

  //const ros = new ROSLIB.Ros({ url: "ws://localhost:9090" });

  ros.on("connection", () => {
    console.log('connesso')
  });

  ros.on("error", (error) => {
    console.log('errore')
  });

  ros.on("close", () => {
    console.log('chiusura')
  });

  const dt_topic = new ROSLIB.Topic({
    ros,
    name: "/fame_dt",
    messageType: "std_msgs/String",
  }); 

  return dt_topic;

}

export default{
  openRosConnection
};