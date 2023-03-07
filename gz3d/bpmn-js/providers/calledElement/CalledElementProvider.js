// Import your custom property entries.
// The entry is a text input field with logic attached to create,
// update and delete the "spell" property.
import callProps from './parts/callProps';

import { is } from 'bpmn-js/lib/util/ModelUtil';

const LOW_PRIORITY = 500;


/**
 * A provider with a `#getGroups(element)` method
 * that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 * @param {Function} translate
 */
export default function CalledElementProvider(propertiesPanel, translate) {

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

      return groups;
    }
  };


  // registration ////////

  // Register our custom magic properties provider.
  // Use a lower priority to ensure it is loaded after
  // the basic BPMN properties.
  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

CalledElementProvider.$inject = [ 'propertiesPanel', 'translate' ];

// Create the custom magic group
function createCalledGroup(element, translate) {

  // create a group called "Magic properties".
  const calledGroup = {
    id: 'calledElement',
    label: translate('Called element'),
    entries: callProps(element)
  };

  return calledGroup;
}
