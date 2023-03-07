import BpmnModeler from 'bpmn-js/lib/Modeler';

import AddExporter from '@bpmn-io/add-exporter';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel';

import calledElementProviderModule from './providers/calledElement';
import callModdleDescriptor from './descriptors/callActivity';

import CamundaBpmnModdle from 'camunda-bpmn-moddle/resources/camunda.json'

import fileDrop from 'file-drops';

import fileOpen from 'file-open';

import download from 'downloadjs';

import fameSimulation from '../resources/simple_scenario.bpmn';

import rosbridge from './rosbridge';

const url = new URL(window.location.href);

const persistent = url.searchParams.has('p');
const active = url.searchParams.has('e');
const presentationMode = url.searchParams.has('pm');

const backURL = 'http://localhost:3000';
const frontURL = 'http://localhost:8080';
const diagrams = [];

/*
jQuery(function() {
  $.ajax({
    url: backURL + '/diagrams',
    type: "GET",
      success: function(response, status, http) {
        if (response) {
            console.log(response)
        }
      }
  });
})
*/

let fileName = 'diagram.bpmn';

const initialDiagram = (() => {
  try {
    return persistent && localStorage['diagram-xml'] || fameSimulation;
  } catch (err) {
    return fameSimulation;
  }
})();

function showMessage(cls, message) {
  const messageEl = document.querySelector('.drop-message');

  messageEl.textContent = message;
  messageEl.className = `drop-message ${cls || ''}`;

  messageEl.style.display = 'block';
}

function hideMessage() {
  const messageEl = document.querySelector('.drop-message');

  messageEl.style.display = 'none';
}

if (persistent) {
  hideMessage();
}

const ExampleModule = {
  __init__: [
    [ 'eventBus', 'bpmnjs', function(eventBus, bpmnjs) {

      if (persistent) {
        eventBus.on('commandStack.changed', function() {
          bpmnjs.saveXML().then(result => {
            localStorage['diagram-xml'] = result.xml;
          });
        });
      }
    } ]
  ]
};

const modeler = new BpmnModeler({
  container: '#canvas',
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    CamundaPlatformPropertiesProviderModule,
    calledElementProviderModule,
    AddExporter,
    ExampleModule
  ],
  propertiesPanel: {
    parent: '#properties-panel'
  },
  moddleExtensions: {
    camunda: CamundaBpmnModdle,
    callActivity: callModdleDescriptor
  },
  exporter: {
    name: 'bpmn-js-token-simulation',
    version: process.env.TOKEN_SIMULATION_VERSION
  },
  keyboard: {
    bindTo: document
  }
});

function openDiagram(diagram) {
  return modeler.importXML(diagram)
    .then(({ warnings }) => {
      if (warnings.length) {
        console.warn(warnings);
      }

      if (persistent) {
        localStorage['diagram-xml'] = diagram;
      }

      modeler.get('canvas').zoom('fit-viewport');
    })
    .catch(err => {
      console.error(err);
    });
}

if (presentationMode) {
  document.body.classList.add('presentation-mode');
}

function openFile(files) {

  // files = [ { name, contents }, ... ]

  if (!files.length) {
    return;
  }

  //hideMessage();

  fileName = files[0].name;

  $('#diagramName').val(fileName.substring(0, fileName.length - 5));
  $('#instanceName').val(fileName.substring(0, fileName.length - 5));

  openDiagram(files[0].contents);
}

document.body.addEventListener('dragover', fileDrop('Open BPMN diagram', openFile), false);

async function downloadDiagram() {
  try {
    const result = await modeler.saveXML({ format: true });
    const { xml } = result;
    download(xml, fileName, 'application/xml');
  } catch (err) {
    console.log(err);
  }
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
})

$('#InstanceButton').on('click', function(){
  window.location.assign(frontURL + '/instances');
})

$('#upload-button').on('click', function() {
  $('#diagramName').val(fileName.substring(0, fileName.length - 5));
  $("#isCallActivity option[value='no']").prop('selected', true);
  $('#instanceCheck').prop('checked', false);
  if(!$('#instanceSection').hasClass('hidden')) {
    $('#instanceSection').addClass('hidden');
  }
  $('#instanceName').val($('#diagramName').val());
  $('#instanceAddress').val('');
  $('#upload-form').dialog();
});

jQuery(function() {
  if(!$('#instanceCheck').is(':checked')) {
    $('#instanceSection').addClass('hidden');
  } else {
    $('#instanceSection').removeClass('hidden');
  }
})

$('#instanceCheck').on('click', function() {
  if(!$('#instanceCheck').is(':checked')) {
    $('#instanceSection').addClass('hidden');
  } else {
    $('#instanceSection').removeClass('hidden');
  }
})

$('#diagram-submit').on('click', async function() {
  var emptyCheck = false;
  var instanceCheck = false;
  if($('#diagramName').val().trim() !== "") {
    if($('#instanceCheck').is(':checked')) {
      if($('#instanceName').val().trim() !== "" && $('#instanceAddress').val().trim() !== "") {
        emptyCheck = true;
        instanceCheck = true;
      }
    } else {
      emptyCheck = true;
    }
  }
  if(emptyCheck) {
    var diagramName = $('#diagramName').val().trim();
    var isCall = 1;
    if($('#isCallActivity').val() == "no") {
      isCall = 0;
    }
    try {
      const result = await modeler.saveXML({ format: true });
      const { xml } = result;
      var data = {
        name_diagram: diagramName,
        content_diagram: xml,
        is_call_activity: isCall
      };
      $.ajax({
        type: 'post',
        url: backURL + '/diagrams',
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        success: function(res) {
          if(instanceCheck) {
            launchInstance(res.data.insertId);
          } else {
            alert(res.message);
            $( "#upload-form" ).dialog('close');
          }
        },  
        error: function () {
          alert('Error during the upload of the diagram');
        }
      });
    } catch(err) {
      alert('Error during the upload of the diagram');
    }
  } else {
    alert('Please do not leave any field empty');
  }
});

function launchInstance(instanceDiagram) {
  var instanceName = $('#instanceName').val().trim();
  var address = $('#instanceAddress').val().trim();
  try {
    let ros = new ROSLIB.Ros({ url: address });
    ros.on("connection", () => {
      console.log('connesso')
      let dt_topic = new ROSLIB.Topic({
        ros,
        name: "/fame_dt",
        messageType: "std_msgs/String",
      });
      var msg = new ROSLIB.Message({
        data: 'mockup' //da aggiungere
      });
      dt_topic.publish(msg);
      var instanceData = {
        name_instance: instanceName,
        address_instance: address,
        diagram_instance: instanceDiagram
      };
      $.ajax({
        type: 'post',
        url: backURL + '/instances',
        data: JSON.stringify(instanceData),
        contentType: "application/json; charset=utf-8",
        success: function(res) {
          window.location.assign(frontURL + '/instances');
        },
        error: function () {
          alert('Error during the upload of the instance');
        }
      });
    });
    ros.on("error", () => {
      alert('Error during the connection to rosbridge');
    });
  } catch(error) {
    alert('Error during the connection to rosbridge');
  }
}

document.body.addEventListener('keydown', function(event) {
  if (event.code === 'KeyS' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();

    downloadDiagram();
  }

  if (event.code === 'KeyO' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();

    fileOpen().then(openFile);
  }
});

document.querySelector('#download-button').addEventListener('click', function(event) {
  downloadDiagram();
});

const propertiesPanel = document.querySelector('#properties-panel');

const propertiesPanelResizer = document.querySelector('#properties-panel-resizer');

let startX, startWidth;

function toggleProperties(open) {

  if (open) {
    url.searchParams.set('pp', '1');
  } else {
    url.searchParams.delete('pp');
  }

  history.replaceState({}, document.title, url.toString());

  propertiesPanel.classList.toggle('open', open);
}

propertiesPanelResizer.addEventListener('click', function(event) {
  toggleProperties(!propertiesPanel.classList.contains('open'));
});

propertiesPanelResizer.addEventListener('dragstart', function(event) {
  const img = new Image();
  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  event.dataTransfer.setDragImage(img, 1, 1);

  startX = event.screenX;
  startWidth = propertiesPanel.getBoundingClientRect().width;
});

propertiesPanelResizer.addEventListener('drag', function(event) {

  if (!event.screenX) {
    return;
  }

  const delta = event.screenX - startX;

  const width = startWidth - delta;

  const open = width > 200;

  propertiesPanel.style.width = open ? `${width}px` : null;

  toggleProperties(open);
});

const remoteDiagram = url.searchParams.get('diagram');

if (remoteDiagram) {
  fetch(remoteDiagram).then(
    r => {
      if (r.ok) {
        return r.text();
      }

      throw new Error(`Status ${r.status}`);
    }
  ).then(
    text => openDiagram(text)
  ).catch(
    err => {
      showMessage('error', `Failed to open remote diagram: ${err.message}`);

      openDiagram(initialDiagram);
    }
  );
} else {
  openDiagram(initialDiagram);
}

toggleProperties(url.searchParams.has('pp'));