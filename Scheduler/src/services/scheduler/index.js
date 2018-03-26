'use strict'

const kue = require('kue');
const queue = kue.createQueue();

exports.createMorningQueue = function(data) {
	let job = queue.create('NotificationQueue', {
		from: 'dailyNotification',
		data: {
			name: data.name,
			notifyTime: data.notifyTime
		}
	})
	.priority('critical')
	.attempts(5)
	.delay(5000)
	.removeOnComplete(false)
	.save((err) => {
		if (err) throw err;
		console.log(`Job ${job.id} saved to the queue.`);
	});
}

exports.createDailyQueue = function(data) {
	data.map(user => {
		let job = queue.create('NotificationQueue', {
			from: 'morningNotification',
			data: {
				name: user.name
			}
		})
		.priority('critical')
		.attempts(5)
		.delay(5000)
		.removeOnComplete(false)
		.save((err) => {
			if (err) throw err;
			console.log(`Job ${job.id} saved to the queue.`);
		});
	});
}