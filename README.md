bfg
===

Big Friendly Gateway creates a read and write stream to various cloud storage providers

BFG is also the [Big Friendly Giant](http://en.wikipedia.org/wiki/The_BFG)

## installation

```
$ npm install bfg
```

## usage

bfg will create a WriteStream for uploads and a ReadStream for downloads to cloud storage providers.

Upload a local file to rackspace:

```js
var fs = require('fs');
var bfg = require('bfg');

var disk = bfg.rackspace({
	username:'...',
	apikey:'...',
	region:'LON',
	container:'my'
})

var localfile = fs.createReadStream(__dirname + '/hello.txt');
var remotefile = disk.createWriteStream('/hello.txt');

localfile.on('end', function(){
	console.log('file uploaded!');
})

localfile.pipe(remotefile);
```

Because bfg is streaming - you can use pipe readstreams to HTTP responses:

```js
var disk = bfg.rackspace(...);

// proxy any request to /filestore to rackspace to serve
app.use('/filestore', function(req, res){
	disk.createReadStream(req.url).pipe(res);
})
```

bfg will also stream form uploads that contain files - this is useful for file uploads that you want to stream directly to the cloud provider:

```js
var app = express();
var disk = bfg.rackspace(...);

app.use('/filestore', disk.handler());
```

## cli

bfg can be used on the cli if you install it globally:

```
$ npm install bfg -g
```

you can then pipe files to and from bfg - the options are configured on the command line:

```
Usage: bfg [options] [command]

Commands:

  upload                 upload a file
  download               download a file

Options:

  -h, --help               output usage information
  -u, --username [value]   Rackspace Username
  -k, --apikey [value]     Rackspace Api Key
  -r, --region [value]     Rackspace Region
  -c, --container [value]  Rackspace Container
  -f, --folder [value]     Rackspace Folder
  -V, --version            output the version number
```

These options can also be configured from the envionment variables:

 * RACKSPACE_USERNAME
 * RACKSPACE_APIKEY
 * RACKSPACE_REGION
 * RACKSPACE_CONTAINER
 * RACKSPACE_FOLDER
 * RACKSPACE_CDN

Assuming the environment variables are set - here is an example of streaming a local file to rackspace:

```
$ cat helloworld.txt | bfg upload /helloworld.txt
```

And streaming from rackspace to a local file:

```
$ bfg download /helloworld.txt > helloworld.txt
```

## api

## var disk = bfg.rackspace({options:...})

Create a new disk from one of the cloud providers bfg supports.  The options vary depending on provider:

### rackspace

 * username - the rackspace username
 * apikey - the rackspace apikey
 * region - the region in which your containers live (e.g. LON)
 * container - the name of the container to connect to

## var rs = disk.createReadStream(filepath)

Create a ReadStream from the contents of the remote filepath

```js
var disk = bfg.rackspace(...);

disk.createReadStream('/hello.txt').pipe(fs.createWriteStream(__dirname + '/hello.txt'));
```

## var ws = disk.createWriteStream(filepath)

Create a WriteStream for the remote filepath

```js
var disk = bfg.rackspace(...);

fs.createReadStream(__dirname + '/hello.txt').pipe(disk.createWriteStream('/hello.txt'));

```

## var handler = disk.handler()

Create a HTTP handler that will GET or POST requests via the appropriate stream

```js
var app = express();
var disk = bfg.rackspace(...);

app.use('/filestore', disk.handler());
```

## CDN

You can instruct bfg to redirect GET requests to the CDN for the container.

First you must pass the cdn option when you make a disk.

Second pass true to the handler function to get a handler that will redirect rather than stream directly:

```js
var disk = bfg.rackspace({
  username:...,
  etc:...,
  cdn:'https://bf9164d97a0cd15823f4-4dba8edb0fc2b3e5cc0f769b1eea32ba.ssl.cf3.rackcdn.com'
})

app.use('/filestore', disk.handler(true));
```

## var folder = disk.folder(basepath)

Return a new disk that will save and load files relative to the given basepath

This is useful for partitioning a container for serveral projects.

```js
var app = express();
var disk = bfg.rackspace(...);
var folder = disk.folder('/subfolder')

fs.createReadStream(__dirname + '/hello.txt').pipe(disk.createWriteStream('/hello.txt'));
```

The file is saved to '/subfolder/hello.txt'


## events

## disk.emit('upload', filepath)

triggered when a file is uploaded to a disk

## disk.emit('download', filepath)

triggered when a file is downloaded from a disk

## license

MIT
