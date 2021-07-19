
const CONSTANTS					= require('./constants');
require('dotenv').config();

module.exports = {
	AWS_S3 : {
		bucket					: process.env.BUCKET_NAME,
		accessKeyId			: process.env.BUCKET_ACCESS_KEY_ID,
		secretAccessKey	: process.env.BUCKET_SECRET_ACCESS_KEY,
		s3URL						: process.env.BUCKET_S3_URL,
		folder					:	CONSTANTS.appDefaults.BUCKET.FOLDER,
		region					:	process.env.BUCKET_REGION
	}
};
