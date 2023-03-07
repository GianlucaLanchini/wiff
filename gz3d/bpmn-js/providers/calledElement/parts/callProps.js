import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

export default function(element) {

  return [
    {
      id: 'calledElement',
      element,
      component: Call,
      isEdited: isSelectEntryEdited
    }
  ];
}

function Call(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const backURL = 'http://localhost:3000';

  const getValue = () => {
    return element.businessObject.calledElement || '';
  }

  const setValue = value => {
    return modeling.updateProperties(element, {
      calledElement: value
    });
  }

  const [ calls, setCalls ] = useState([]);

  useEffect(() => {
    function fetchCalls() {
      fetch(backURL + '/callActivities')
        .then(res => res.json())
        .then(allCalls => {
          let options = []; 
          var diagrams = allCalls.data;
          for (let i = 0; i < diagrams.length; i++) {
            options.push(diagrams[i])
          }
          setCalls(options);
        })
        .catch(error => console.error(error));
    }

    fetchCalls();
  }, [ setCalls ]);

  const getOptions = () => {
    return [
      { label: '<none>', value: undefined },
      ...calls.map(call => ({
        label: call.name_diagram,
        value: call.id_diagram + ':' + call.name_diagram
      }))
    ];
  }

  return <SelectEntry
  element={element}
  id={id}
  label={translate('Called element')}
  getValue={getValue}
  setValue={setValue}
  getOptions={getOptions}
  debounce={debounce}
  />
}

