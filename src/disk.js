var EventEmitter = require('events').EventEmitter;
var util = require('util');
var formparser = require('./formparser');

function Disk(driver, container){
	EventEmitter.call(this);
	this._driver = driver;
	this._container = container;
}

module.exports = Disk;

util.inherits(Disk, EventEmitter);

Disk.prototype.createReadStream = function(filepath){
	var self = this;
	var rs = this._driver.download({
    container: this._container,
    remote: filepath
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
    remote: filepath
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

Disk.prototype.handler = function(){
	var self = this;
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
			var remote = self.createReadStream(req.url);

			remote.on('error', function(error){
				res.statusCode = 500;
				res.end(error.toString())
			})

			remote.pipe(res);
		}
	}
}