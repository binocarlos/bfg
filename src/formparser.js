var Busboy = require('busboy');
var EventEmitter = require('events').EventEmitter;

module.exports = function(req, done){

	var upload = new EventEmitter();
	var busboy = new Busboy({ headers: req.headers });

	var found = false;

	busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
		if(found){
			return;
		}
		found = true;
		done(null, filename, file);
  });

  req.on('error', function(error){
  	done(error);
	})
  req.pipe(busboy);
}