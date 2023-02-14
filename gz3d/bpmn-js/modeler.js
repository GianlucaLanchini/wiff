import BpmnModeler from 'bpmn-js/lib/Modeler';

import AddExporter from '@bpmn-io/add-exporter';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule
} from 'bpmn-js-properties-panel';

import fileDrop from 'file-drops';

import fileOpen from 'file-open';

import download from 'downloadjs';

import fameSimulation from '../resources/simple_scenario.bpmn';

import rosbridge from './rosbridge';

const url = new URL(window.location.href);

const persistent = url.searchParams.has('p');
const active = url.searchParams.has('e');
const presentationMode = url.searchParams.has('pm');

const backURL = 'http://localhost:3000'
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
    AddExporter,
    ExampleModule
  ],
  propertiesPanel: {
    parent: '#properties-panel'
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

$('#upload-button').on('click', function() {
  $( "#upload-form" ).dialog();
});

$('#diagram-submit').on('click', async function() {
  if($('#diagramName').val().trim() !== "") {
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
        success: function (data) {
          alert(data.message);
          console.log(data);
          $( "#upload-form" ).dialog('close');
        },  
        error: function () {
          alert('Error during Upload')
        }
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    alert('Please insert a valid name for the diagram!')
  }
});

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