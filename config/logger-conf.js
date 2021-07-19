const appRoot   =   require('path').resolve('.');
require('dotenv').config();

module.exports = {
	WINSTON : {
		OPTIONS: {
			APP: {
				level: 'info', // log only if less than or equal to this level
				filename: `${appRoot}/logs/app-%DATE%.log`,
				datePattern: 'YYYY-MM-DD-HH',
				zippedArchive: true,
				maxSize: '2m',
				maxFiles: '5d',
				auditFile: 'app-audit.json',
				json: false,
				handleExceptions: true
			},
			ERRORS: {
				level: 'error',
				filename: `${appRoot}/logs/error-%DATE%.log`,
				datePattern: 'YYYY-MM-DD-HH',
				zippedArchive: true,
				maxSize: '2m',
				maxFiles: '5d',
				auditFile: 'error-audit.json',
				json: false,
				handleExceptions: true
			},
			CONSOLE: {
				level: 'silly', // everything
				handleExceptions: true,
				json: false
			}
		}
	}
  
};