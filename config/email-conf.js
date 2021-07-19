'use strict';
require('dotenv').config();

module.exports = {
	AWS_SES : {
		accessKeyId	:	process.env.SES_ACCESS_KEY_ID ,
		secretAccessKey	:	process.env.SES_SECRET_ACCESS_KEY,
		region	:	process.env.SES_REGION
	}
};