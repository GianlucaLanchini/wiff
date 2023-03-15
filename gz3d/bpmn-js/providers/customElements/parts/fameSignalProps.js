import { SelectEntry, isSelectEntryEdited, TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import { 
  createElement,
  createSignalParameters,
  getSignalParameters,
  getSignalParametersExtension
  } from '../util';

const backURL = 'http://localhost:3000';

export default function(element) {

  const entries = [];

  entries.push({
    id: 'fameSignalType',
    element,
    component: FameSignalType,
    isEdited: isSelectEntryEdited
  });

  

  if(is(element, 'bpmn:EndEvent') || is(element, 'bpmn:IntermediateThrowEvent')) {

    const [ types, setMessages ] = useState([]);

    useEffect(() => {
      function fetchMessages() {
        fetch(backURL + '/messages')
          .then(res => res.json())
          .then(allMessages => {
            let options = []; 
            var messages = allMessages.data;
            for (let i = 0; i < messages.length; i++) {
              options.push(messages[i])
            }
            setMessages(options);
          })
          .catch(error => console.error(error));
      }

      fetchMessages();
    }, [ setMessages ]);

    let type = []; 

    for (let i = 0; i < types.length; i++) {
      if(types[i].cat_msgs + '/' + types[i].name_msgs == element.businessObject.eventDefinitions[0].message_type) {
        type = types[i];
      }  
    }

    let fields = type.payload_msgs;

    let typeName = '';

    let count = 0;

    for(let x in fields) {
      count++;
    }

    if(count > 1) {
      entriesType(fields, typeName);
    } else if(count == 1) {
      for(let x in fields) {
        entries.push({
          id: x,
          element,
          component: FameSignalMessage,
          isEdited: isTextFieldEntryEdited
        }); 
      }
    }

    function entriesType(fields, name) {
      for(let x in fields) {
        if(fields[x].substring(0, 7) == 'id_msgs') {
          let typeID = fields[x].substring(8);
          for (let i = 0; i < types.length; i++) {
            if(types[i].id_msgs.toString() == typeID) {
              if(name == '') {
                entriesType(types[i].payload_msgs, x);
              } else {
                entriesType(types[i].payload_msgs, name + '/' + x);
              }
            }  
          }
        } else {
          entries.push({
            id: name,
            element,
            component: FameSignalMessage,
            isEdited: isTextFieldEntryEdited
          });
        }
      }
    }
  }
  

  return entries;
}

function FameSignalType(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => {
    return element.businessObject.eventDefinitions[0].message_type || '';
  }

  const setValue = value => {
    const businessObject = getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');
    if(extensionElements) {
      let extension = getSignalParametersExtension(element);
      if(extension) {
        let newValues = extensionElements.values.filter(element => element.$type != 'signalData:Parameters');
        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...newValues ]
          }
        });
      }
    }
    const signalEventDefinition = element.businessObject.eventDefinitions.filter(value => value.$type == 'bpmn:SignalEventDefinition')
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: signalEventDefinition[0],
      properties: {
        message_type: value
      }
    });
  }

  const [ types, setMessages ] = useState([]);

  useEffect(() => {
    function fetchMessages() {
      fetch(backURL + '/messages')
        .then(res => res.json())
        .then(allMessages => {
          let options = []; 
          var messages = allMessages.data;
          for (let i = 0; i < messages.length; i++) {
            options.push(messages[i])
          }
          setMessages(options);
        })
        .catch(error => console.error(error));
    }

    fetchMessages();
  }, [ setMessages ]);

  const getOptions = () => {
    return [
      { label: '<none>', value: undefined },
      ...types.map(type => ({
        label: type.cat_msgs + '/' + type.name_msgs,
        value: type.cat_msgs + '/' + type.name_msgs
      }))
    ];
  }

  return <SelectEntry
  element={element}
  id={id}
  label={translate('message_type')}
  getValue={getValue}
  setValue={setValue}
  getOptions={getOptions}
  debounce={debounce}
  />
}

function FameSignalMessage(props) {
  
  const { element, id } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const setValue = (value) => {

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    if(!extensionElements) {
        extensionElements = createElement(
            'bpmn:ExtensionElements',
            { values: [] },
            businessObject,
            bpmnFactory
        );

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: businessObject,
          properties: { extensionElements }
        });
    }

    let extension = getSignalParametersExtension(element);

    if(!extension) {
      extension = createSignalParameters({
          values: []
      }, extensionElements, bpmnFactory);

      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: extensionElements,
        properties: {
          values: [ ...extensionElements.get('values'), extension ]
        }
      });

    }

    if(extension.values.length > 0) {
      const parameters = extension.values.filter(value => value.name == id);
      if(parameters.length > 0) {
        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: parameters[0],
          properties: {
            value: value
          }
        });
        return;
      }
    }

    const newParameter = createElement('signalData:Parameter', {
      name: id,
      value: value
    }, extension, bpmnFactory);

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: extension,
      properties: {
        values: [ ...extension.get('values'), newParameter ]
      }
    });

  };

  const getValue = () => {
    const businessObject = getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');
    if(extensionElements) {
      let extension = getSignalParametersExtension(element);
      if(extension) {
        if(extension.values.length > 0) {
          let values = extension.values.filter(value => value.name == id);
          if(values.length > 0) {
            return values[0].value;
          }
        }
      }
    }
    return '';
  };

  return <TextFieldEntry
  element={element}
  id={id}
  label={translate(id)}
  getValue={getValue}
  setValue={setValue}
  debounce={debounce}
  />
}
