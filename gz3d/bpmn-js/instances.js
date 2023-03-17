import { domify } from 'min-dom';

const backURL = 'http://localhost:3000';
const frontURL = 'http://localhost:8080';

let instances = []; 

jQuery(function() {
    $.ajax({
      url: backURL + '/instances',
      type: "GET",
        success: function(response, status, http) {

          if (response) {
            createEmptyInstance();
            instances = response.data;
            if(instances.length == 0) {
              createEmptyInstance();
            } else {
              instances.forEach(e => {
                pushConnection(e);
              });
            }
          }

        },
        error: function () {
          console.log('error')
        }
    });
})

function createInstance(instance) {
    if($('.noInstance').length > 0) {
      $('.noInstance').remove();
    }
    var child = domify(`
        <div class="container" data-index="${instance.id_instance}">
            <p class="information">${instance.name_instance} - ${instance.address_instance}</p>            
            <button style="font-size:24px;" class="inspectbtn"><i class="fa fa-eye"></i></button>
        </div>
    `);
    document.getElementById('box').appendChild(child);
}

function removeInstance(id) {
  $(`.container[data-index="${id}"]`).remove();
  if($('.container').length == 0) {
    createEmptyInstance();
  } 
}

function createEmptyInstance() {
  if($('.noInstance').length == 0) {
    var child = domify(`
      <div class="container noInstance">
          <p class="information">There are no active Instances</p>
      </div>
    `);
    document.getElementById('box').appendChild(child);
  }
}

/*
$('#navigation').on({
    mouseenter: function () {
      $('#navigation').addClass('navigationTransition');
    },
    mouseleave: function () {
      $('#navigation').removeClass('navigationTransition');
    }
});
*/
  
$('#modelerButton').on('click', function(){
    window.location.assign(frontURL);
});

$('#InstanceButton').on('click', function(){
    window.location.assign(frontURL + '/instances');
});

function pushConnection(instance) {
  let ros = new ROSLIB.Ros({ url: instance.address_instance });
  ros.on("connection", () => {
    createInstance(instance);
    console.log('connesso')
    let dt_topic = new ROSLIB.Topic({
      ros,
      name: "/fame_dt",
      messageType: "std_msgs/String",
    });
    dt_topic.subscribe((message) => {
      if(typeof message == 'string') {
        const json = JSON.parse(message.data);
        if(json.type == 'end') {
          /*
          ros.close();
          */
          if($(`.container[data-index="${instance.id_instance}"]`)) {
            removeInstance(instance.id_instance);
          }
          $.ajax({
            url: backURL + '/instances/' + instance.id_instance,
            type: "DELETE",
              success: function(response, status, http) {
                if (response) {
                  if(response.message == "Removed Instance") {
                    console.log('instanza ' + instance.id_instance + ' rimossa')
                  }
                }
              },
              error: function () {
                console.log('error')
              }
          })
        } 
      }
    });

    $('.inspectbtn').on('click', function(){
      var index = $(this).parent().data('index');
      instances.forEach(e => {
        if(e.id_instance == index) {
          $.ajax({
            url: backURL + '/diagrams/' + e.diagram_instance,
            type: "GET",
              success: function(response, status, http) {
                if (response) {
                  var diagram = response.data[0].content_diagram;
                  var url = new URL(frontURL + '/viewer');
                  localStorage.setItem('diagram-xml', diagram);
                  localStorage.setItem('instance-id', e.id_instance);
                  window.location.assign(url);
                }
              },
              error: function () {
                console.log('error')
              }
          });
        }
      })
    });
    
  });

  ros.on("error", (error) => {
    if($('.container').length == 0) {
      createEmptyInstance();
    } 
    setTimeout(pushConnection(instance, 10000));
  });

  ros.on("close", () => {
    if($(`.container[data-index="${instance.id_instance}"]`)) {
      removeInstance(instance.id_instance);
    }
    /*
    $.ajax({
      url: backURL + '/instances/' + instance.id_instance,
      type: "DELETE",
        success: function(response, status, http) {
          if (response) {
            if(response.message == "Removed Instance") {
              console.log('instanza ' + instance.id_instance + ' rimossa')
            }
          }
        },
        error: function () {
          console.log('error')
        }
    })
    */
    console.log('chiusura' + instance.id_instance)
  });
}
