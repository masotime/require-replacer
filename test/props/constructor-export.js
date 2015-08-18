'use strict';

function World() {
	this.name = 'world';
}

World.prototype.getName = function() {
	return this.name;
};

module.exports = World;