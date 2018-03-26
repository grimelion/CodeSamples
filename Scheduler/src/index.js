'use strict'

const startDB = require('./services/db').startDB;
const getAllUsers = require('./services/db').getAllUsers;
const cron = require('node-cron');
const spawn = require('child-process-promise').spawn;   
const scheduler = require('./services/scheduler/index');

startDB();

console.log('[Morning scheduler started]');
cron.schedule('* * * * * *', () => {
	const promise = spawn('node', ['services/workers/index.js'], {                                 
		cwd: __dirname,                                                              
		stdio: ['ignore', 'pipe', 'pipe']                                            
	}); 
	const childProcess = promise.childProcess;

	childProcess.stdout.on('data', function (data) {
		const info = JSON.parse(data.toString());
		console.log(info);
		scheduler.createMorningQueue(info);
	});
	childProcess.stderr.on('data', function (data) {
		console.log('[spawn] stderr: ', data.toString());
	});

	promise.catch((err) => console.error('[spawn] ERROR: ', err));
});

console.log('[Daily scheduler started]');
cron.schedule('0 0 9 * * *', () => {
	getAllUsers().then(data => {
		scheduler.createDailyQueue(data);
	});
});