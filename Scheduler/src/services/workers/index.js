'use strict'
const getUserByDate = require('../db').getUserByDate;

(function() {
	const date = new Date();
	const notifyTime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
	getUserByDate(notifyTime);
})()