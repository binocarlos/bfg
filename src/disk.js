var EventEmitter = require('events').EventEmitter;
var util = require('util');
var formparser = require('./formparser');

function Disk(driver, options){
	EventEmitter.call(this);
	this._driver = driver;
	options = options || {}

	this._options = options;
	this._container = options.container;
	this._folder = options.folder || '';
}

module.exports = Disk;

util.inherits(Disk, EventEmitter);

Disk.prototype.folder = function(basepath){
	var newoptions = JSON.parse(JSON.stringify(this._options));
	newoptions.folder = basepath;
	return new Disk(this._driver, newoptions);
}

Disk.prototype.createReadStream = function(filepath){
	var self = this;
	var rs = this._driver.download({
    container: this._container,
    remote: this._folder + filepath
	})

	rs.on('end', function(){
		self.emit('download', filepath);
	})

	return rs;
}

Disk.prototype.createWriteStream = function(filepath){
	var self = this;
	var ws = this._driver.upload({
    container: this._container,
    remote: this._folder + filepath
	})

	ws.on('end', function(){
		self.emit('upload', filepath);
	})

	return ws;
}

Disk.prototype.upload = function(filepath, source, res){
	var self = this;
	var uploader = self.createWriteStream(filepath);
	uploader.on('end', function(){
		res.end(req.url)
	})
	uploader.on('error', function(){
		res.statusCode = 500;
		res.end(error.toString());
	})
	source.pipe(uploader);
	return uploader;
}

Disk.prototype.handler = function(cdn){
	var self = this;

	if(cdn && !this._options.cdn){
		throw new Error('cdn option required for CDN redirects');
	}
	return function(req, res){
		if(req.method=='POST'){
			if(req.headers['content-type'].indexOf('multipart/form-data')==0){
				formparser(req, function(error, filename, file){
					if(error){
						res.statusCode = 500;
						res.end(error);
						return;
					}
					self.upload(req.url + '/' + filename, file, res);
				})
			}
			else{
				self.upload(req.url, req, res);
			}
		}
		else{
			if(cdn){
				res.writeHead(302, {
				  'Location': this._options.cdn + req.url
				});
				res.end();
			}
			else{
				var remote = self.createReadStream(req.url);

				remote.on('error', function(error){
					res.statusCode = 500;
					res.end(error.toString())
				})

				remote.pipe(res);
			}
			
		}
	}
}