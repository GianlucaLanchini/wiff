import { domify } from 'min-dom';

import rosbridge from './rosbridge';

const backURL = 'http://localhost:3000';
const frontURL = 'http://localhost:8080';

var instances = [];

jQuery(function() {
    $.ajax({
      url: backURL + '/instances',
      type: "GET",
        success: function(response, status, http) {
          if (response) {
            instances = response.data;
            console.log(instances);
            instances.forEach(e => {
                createInstance(e)
            });
          }
        }
    });
})

function createInstance(instance) {
    var child = domify(`
        <div class="container" data-index="${instance.id_instance}">
            <p class="information">${instance.name_instance}</p>            
            <button style="font-size:24px;" class="inspectbtn"><i class="fa fa-eye"></i></button>
        </div>
    `);
    document.getElementById('box').appendChild(child);
}

$('#navigation').on({
    mouseenter: function () {
      $('#navigation').addClass('navigationTransition');
    },
    mouseleave: function () {
      $('#navigation').removeClass('navigationTransition');
    }
});
  
$('#modelerButton').on('click', function(){
    window.location.assign(frontURL);
});

$('#InstanceButton').on('click', function(){
    window.location.assign(frontURL + '/instances');
});
  
