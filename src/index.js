var Disk = require('./disk');
var Rackspace = require('./rackspace');

module.exports = {
	rackspace:function(options){
		options = options || {};
		var driver = Rackspace(options);
		return new Disk(driver, options);
	}
}