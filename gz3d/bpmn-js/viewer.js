import TokenSimulationModule from '../../lib/viewer';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import fileOpen from 'file-open';
import fameSimulation from '../resources/simple_scenario.bpmn';
import rosbridge from './rosbridge';

const url = new URL(window.location.href);

rosbridge.dt_listener.subscribe((message) => {
  const json = JSON.parse(message.data.replaceAll(/'/g, '"'));
  switch(json.type) {
    case 'start':{
      fame.animateTask(json.id, json.instance);
      break;
    } 
    case 'stop':{
      fame.deanimateTask(json.id)
      break;
    }
    default :{
      fame.animateSequenceFlow(json.id, json.instance);
      break;
    }
  }
});

const persistent = url.searchParams.has('p');
const active = url.searchParams.has('e');
const presentationMode = url.searchParams.has('pm');

const initialDiagram = (() => {
  try {
    return persistent && localStorage['diagram-xml'] || fameSimulation;
  } catch (err) {
    return fameSimulation;
  }
})();

const ExampleModule = {
  __init__: [
    ['eventBus', 'bpmnjs', 'toggleMode', function(eventBus, bpmnjs, toggleMode) {

      eventBus.on('diagram.init', 500, () => {
        toggleMode.toggleMode(active);
      });

    }]
  ]
};

const viewer = new BpmnViewer({
  container: '#canvas',
  additionalModules: [
    ExampleModule,
    TokenSimulationModule
  ],
  keyboard: {
    bindTo: document
  }
});

const fame = viewer.get("fameConnector");

function openDiagram(diagram) {
  return viewer.importXML(diagram)
    .then(({ warnings }) => {
      if (warnings.length) {
        console.warn(warnings);
      }

      if (persistent) {
        localStorage['diagram-xml'] = diagram;
      }

      viewer.get('canvas').zoom('fit-viewport');
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

  openDiagram(files[0].contents);
}

jQuery(function() {
  document.querySelector('.bts-toggle-mode').classList.add('hidden');
  if(!($('.bjs-container').hasClass('simulation'))) {
    $('.bts-toggle-mode').trigger('click')
  }
})

/*
document.getElementById('prova').addEventListener('click', function() {
  //fame.animateSequenceFlow('SequenceFlow_1xib75z')
  fame.animateTask('ParallelGateway_0s75uad')
  setTimeout(function (){
    fame.deanimateTask('ParallelGateway_0s75uad')
  }, 2000);

})

const inputDiagram = document.getElementById('inputDiagram');

inputDiagram.addEventListener('change', function() {
  $('.bts-toggle-mode').trigger('click')
  readFile(inputDiagram.files[0])
  $('.bts-toggle-mode').trigger('click')
});
*/

function readFile(file) {

  var reader = new FileReader();

  reader.addEventListener('loadend', function(e) {
    openDiagram(e.target.result)
  })

  reader.onerror = function(event) {
    done(event.target.error);
  };

  reader.readAsText(file);
}

document.body.addEventListener('keydown', function(event) {
  if (event.code === 'KeyO' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();

    fileOpen().then(openFile);
  }
});

openDiagram(initialDiagram);