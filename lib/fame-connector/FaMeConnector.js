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

FaMeConnector.prototype.animateSequenceFlow = function(elementID) {

  const element = this._elementRegistry.get(elementID);

  this._animation.animate(element, {"element": element});
};

FaMeConnector.prototype.animateTask = function(elementID) {

  const element = this._elementRegistry.get(elementID);

  const scope = this._simulator.createScope({"element": element});

  this._tokenCount.addTokenCount(element, [scope]);
};

FaMeConnector.prototype.deanimateTask = function(elementID) {

  if(!(document.querySelector('[data-container-id=' + elementID + ']'))) {
    console.log('No active Task')
  } else {
    const element = this._elementRegistry.get(elementID);
    this._tokenCount.removeTokenCount(element);
  }

};
