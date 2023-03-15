import callProps from './parts/callProps';

import ObjectParametersProps from './parts/objectParametersProps';

import fameSignalProps from './parts/fameSignalProps';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import { ListGroup } from '@bpmn-io/properties-panel';

const LOW_PRIORITY = 500;


/**
 * A provider with a `#getGroups(element)` method
 * that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 * @param {Function} translate
 */
export default function CustomElementsProvider(propertiesPanel, injector, translate) {

  // API ////////

  /**
   * Return the groups provided for the given element.
   *
   * @param {DiagramElement} element
   *
   * @return {(Object[]) => (Object[])} groups middleware
   */
  this.getGroups = function(element) {

    /**
     * We return a middleware that modifies
     * the existing groups.
     *
     * @param {Object[]} groups
     *
     * @return {Object[]} modified groups
     */
    return function(groups) {

      if(is(element, 'bpmn:CallActivity')) {

        const calledElementTab = groups.find((e) => e.id === "CamundaPlatform__CallActivity");

        const entries = calledElementTab.entries;

        if (element.businessObject.get('calledElement') !== undefined) {
          entries.splice(1, 1, callProps(element)[0]);
        }

      }

      if(is(element, 'bpmn:ScriptTask')) {

        const scriptTab = groups.find((e) => e.id === "CamundaPlatform__Script");

        const entries = scriptTab.entries;

        if(element.businessObject.scriptFormat == undefined || element.businessObject.scriptFormat == '') {
          element.businessObject.scriptFormat = 'JavaScript';
          /*
          console.log(element.businessObject);
          console.log(element.businessObject.get('scriptType'))
          */
          //console.log($('.bio-properties-panel-entry[data-entry-id="scriptType"] select').val())
          //$('#bio-properties-panel-scriptType').val('script').trigger();
          //console.log($('.bio-properties-panel-group').find('[data-group-id="group-CamundaPlatform__Script"]'))
          //$('.bio-properties-panel-group').find('[data-group-id="group-CamundaPlatform__Script"]').trigger('click')
        }

      }

      if(is(element, 'bpmn:StartEvent') || is(element, 'bpmn:EndEvent') || is(element, 'bpmn:IntermediateCatchEvent') || is(element, 'bpmn:IntermediateThrowEvent')) {

        const siganlTab = groups.find((e) => e.id === "signal");

        if(siganlTab !== undefined) {
          groups.splice(3, 0, createFameSignal(element, translate));
        }

      }

      if(is(element, 'bpmn:DataObjectReference')) {
        groups.splice(2, 0, createObjectParametersGroup(element, injector, translate));
      }

      console.log(element)

      return groups;
    }
  };


  // registration ////////

  // Register our custom magic properties provider.
  // Use a lower priority to ensure it is loaded after
  // the basic BPMN properties.
  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

CustomElementsProvider.$inject = [ 'propertiesPanel', 'injector', 'translate' ];

function createFameSignal(element, translate) {

  const fameGroup = {
    id: 'fameSignal',
    label: translate('FaMe'),
    entries: fameSignalProps(element)
  };

  return fameGroup;
}

function createObjectParametersGroup(element, injector, translate) {

  const objectParametersGroup = {
    id: 'ObjectParameters',
    label: translate('FaMe'),
    component: ListGroup,
    ...ObjectParametersProps({ element, injector })
  };

  return objectParametersGroup;
}