var pkgcloud = require('pkgcloud');
var tools = require('./tools');

module.exports = function(options){
	tools.check_options(options, [
		'username',
		'apikey',
		'region'
	])
	
	return pkgcloud.storage.createClient({
	  provider: 'rackspace',
	  username: options.username,
	  apiKey: options.apikey,
	  region: options.region
	})
}