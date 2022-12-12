export default function FaMeConnector(elementRegistry, animation, tokenCount, simulator) {

  this._elementRegistry = elementRegistry;
  this._animation = animation;
  this._tokenCount = tokenCount;
  this._simulator = simulator;

}

FaMeConnector.$inject = [
  'elementRegistry',
  'animation',
  'tokenCount',
  'simulator'
];

FaMeConnector.prototype.animateSequenceFlow = function(elementID, tokenID) {

  if(!(document.querySelector('[data-element-id=' + elementID + ']'))) {
    console.log('No SequenceFlow with this ID')
  } else {
    const element = this._elementRegistry.get(elementID);
    this._animation.animate(element, {
      "element": element,
      "token": tokenID
    });
  }

};

FaMeConnector.prototype.animateTask = function(elementID, tokenID) {

  if(!(document.querySelector('[data-element-id=' + elementID + ']'))) {
    console.log('No active Task')
  } else {
    const element = this._elementRegistry.get(elementID);
    const scope = this._simulator.createScope({"element": element});
    scope["token"] = tokenID;
    this._tokenCount.addTokenCount(element, [scope]);
  } 

};

FaMeConnector.prototype.deanimateTask = function(elementID) {

  if(!(document.querySelector('[data-container-id=' + elementID + ']'))) {
    console.log('No active Task')
  } else {
    const element = this._elementRegistry.get(elementID);
    this._tokenCount.removeTokenCount(element);
  }

};
