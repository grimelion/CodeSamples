# Node.js scheduler push service with workers
This project is intended as a server-side console component for working with tasks that can be performed as requests are received.

## Here is my schema
![alt text](http://s010.radikal.ru/i311/1711/1f/15d50ba5e2f7.png)

My last tiny pet project with microservice architecture that provided:
1. Keeping users in the database (MongoDB)
2. Communication between services via events (Kue scheduler)
3. Working with CRON (set time when job must been completed)
4. Working with workers

## Installation
1. `git clone https://github.com/grimelion/samples.git`
2. `cd samples/Scheduler`
3. `npm i && npm start`
4. (in other terminal) `npm run scheduler`
