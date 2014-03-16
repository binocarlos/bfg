var bfg = require('../src');
var fs = require('fs');

var username = process.env.RACKSPACE_USERNAME;
var apikey = process.env.RACKSPACE_APIKEY;
var region = process.env.RACKSPACE_REGION;
var container = process.env.RACKSPACE_CONTAINER;

describe('bfg', function(){

	function getdisk(){
		return bfg.rackspace({
			username:username,
			apikey:apikey,
			region:region,
			container:container
		})
	}
	
	describe('constructor', function(){

		

		it('should throw if there are no options', function(){
			(function(){
				var disk = bfg.rackspace();
			}).should.throw();
		})

		it('should not throw if there are options', function(){
			var disk = getdisk();
		})

	})

	describe('storage', function(){

		it('should upload and download a text file', function(done){

			this.timeout(10000);

			var disk = getdisk();

			var time = new Date().getTime();
			var test_string = 'hello world ' + time;
			fs.writeFileSync(__dirname + '/fixtures/hello.txt', test_string);

			function upload(uploaddone){

				var localsource = fs.createReadStream(__dirname + '/fixtures/hello.txt');
				var remotesink = disk.createWriteStream('/hello.txt');

				remotesink.on('error', function(err){
					throw new Error(err);
				})

				localsource.on('end', function(){
					uploaddone();
				});

				localsource.pipe(remotesink);
			}

			function download(downloaddone){

				var remotesource = disk.createReadStream('/hello.txt');
				var localsink = fs.createWriteStream(__dirname + '/fixtures/hello.back.txt');

				remotesource.on('error', function(err){
					throw new Error(err);
				})

				remotesource.on('end', function(){

					setTimeout(function(){

						var contentA = fs.readFileSync(__dirname + '/fixtures/hello.txt', 'utf8');
						var contentB = fs.readFileSync(__dirname + '/fixtures/hello.back.txt', 'utf8');

						contentA.should.equal(contentB);

						downloaddone();
					}, 500)

				})

				remotesource.pipe(localsink);
			}

			upload(function(){
				setTimeout(function(){
					download(function(){
						done();
					})
				}, 1000);
			})
			
		})

	})


	describe('folder', function(){

		it('should upload and download a text file', function(done){

			this.timeout(10000);

			var disk = getdisk();
			var folder = disk.folder('/foldertest');

			var time = new Date().getTime();
			var test_string = 'hello world ' + time;
			fs.writeFileSync(__dirname + '/fixtures/hello.txt', test_string);

			function upload(uploaddone){

				var localsource = fs.createReadStream(__dirname + '/fixtures/hello.txt');
				var remotesink = folder.createWriteStream('/hello.txt');

				remotesink.on('error', function(err){
					throw new Error(err);
				})

				localsource.on('end', function(){
					uploaddone();
				});

				localsource.pipe(remotesink);
			}

			function download(downloaddone){

				var remotesource = disk.createReadStream('/foldertest/hello.txt');
				var localsink = fs.createWriteStream(__dirname + '/fixtures/hello.back.txt');

				remotesource.on('error', function(err){
					throw new Error(err);
				})

				remotesource.on('end', function(){

					setTimeout(function(){

						var contentA = fs.readFileSync(__dirname + '/fixtures/hello.txt', 'utf8');
						var contentB = fs.readFileSync(__dirname + '/fixtures/hello.back.txt', 'utf8');

						contentA.should.equal(contentB);

						downloaddone();
					}, 500)

				})

				remotesource.pipe(localsink);
			}

			upload(function(){
				setTimeout(function(){
					download(function(){
						done();
					})
				}, 1000);
			})
			
		})

	})

})
