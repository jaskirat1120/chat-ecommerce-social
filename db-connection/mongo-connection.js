// npm modules
const mongoose	=	require('mongoose');

// constants imported
const MONGO_URI	=	require('../config').dbConf.MONGO_URI;
console.log("MONGO_URI",MONGO_URI)

// local modules
const Logger	=	require('../lib/log-manager').logger;
module.exports = {
	connect :() => {
		return mongoose.connect(MONGO_URI, {useUnifiedTopology: true,useNewUrlParser: true,useFindAndModify:false,useCreateIndex:true}).then(data => {
			Logger.info('Mongodb connected.....');
		}).catch(err => {
			Logger.error('Mongodb connection error.....',new Error(err));
			console.log('err',err)
			process.exit(1);
		})
	}
}
