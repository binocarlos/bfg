module.exports = {
	check_options:function(options, required){
		if(!options.container){
			throw new Error('container option required');
		}
		(required || []).forEach(function(field){
			if(!options[field]){
				throw new Error(field + ' option required');
			}
		})
	},
	env_options:function(options){
		return {
			username:options.username || process.env.RACKSPACE_USERNAME,
			apikey:options.apikey || process.env.RACKSPACE_APIKEY,
			region:options.region || process.env.RACKSPACE_REGION,
			container:options.container || process.env.RACKSPACE_CONTAINER
		}
	}
}