var Entities = {};

function Entity() {
    this.id = Entity.prototype._idGen++;
    Entities[this.id] = this;
};

Entity.prototype = {
    _idGen: 0,

    addComponent: function(component) {
        this[component.name] = component;
    },

    removeComponent: function(component) {
        delete this[component.name];
    },

    delete: function() {
        delete Entities[this.id];
    }
};

function Position(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};
Position.prototype.name = "position";

function THREEObject(object) {};
THREEObject.prototype.name = "threeObject";

var Component = { Position, THREEObject };

module.exports = { Entity, Entities, Component };
