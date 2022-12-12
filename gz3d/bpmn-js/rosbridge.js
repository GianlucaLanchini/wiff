const ros = new ROSLIB.Ros({ url: "ws://localhost:9090" });

ros.on("connection", () => {
  console.log('connesso')
});

ros.on("error", (error) => {
  console.log('errore')
});

ros.on("close", () => {
  console.log('chiusura')
});

const dt_listener = new ROSLIB.Topic({
    ros,
    name: "/fame_dt",
    messageType: "std_msgs/String",
});  

export default{
    ros,
    dt_listener
};