'use strict'

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const usersFactory = require('../usersFactory');

const url = 'mongodb://188.166.14.233:27017/ncube'; // my own VPS on DigitalOcean

function createUsers() {
	const users = [];
	for (let i = 0, len = 1000; i < len; i++) {
		let userObj = new usersFactory();
		let userInst = userObj.generateUser();
		users.push(userInst);
	}
	return users;
}

exports.startDB = function() {
	MongoClient.connect(url, (err, db) => {
		assert.equal(null, err);
		console.log("Connected correctly to server.");

		db.createCollection('users', (err, collection) => {
			assert.equal(null, err);
			let usersList = createUsers();
			collection.insert(usersList).catch(err => console.log(err)).then(() => db.close())
		})
	});
}

exports.getUserByDate = function(date) {
	MongoClient.connect(url, (err, db) => {
		assert.equal(null, err);
		db.collection('users').findOne({ 'notifyTime': date}, (err, result) => {
			if(err) return;
			db.close();
			if(result !== null)
				console.log(JSON.stringify({ name: result.name, notifyTime: result.notifyTime }));
		});
	});
}

exports.getAllUsers = function() {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, db) => {
			if(err) reject(err);
			resolve(db);
		});
	}).then((db) => {
		return new Promise((resolve, reject) => {
		    const collection = db.collection('users');
		    collection.find().toArray(function(err, items) {
	          	if (err) reject(err);
            	resolve(items);         
	        });
		})
	})
}