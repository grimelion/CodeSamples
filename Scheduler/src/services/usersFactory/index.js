'use strict'
const faker = require('faker');

function User() { 
	this.name = '';
	this.notifyTime = 0;
}

User.prototype.getUserInfo = function() {
	return {
		name: this.name,
		notifyTime: this.notifyTime
	}
}

User.prototype.generateUser = function() {
	return {
		name: faker.name.firstName() + ' ' + faker.name.lastName(),
		notifyTime: faker.date.recent().toString().slice(16, 24)
	}
}

module.exports = User;