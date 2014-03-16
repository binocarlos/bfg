#!/usr/bin/env node
var version = require(__dirname + '/../package.json').version;
var program = require("commander");
var bfg = require('./index');
var tools = require('./tools');

program
  .option('-u, --username [value]', 'Rackspace Username')
  .option('-k, --apikey [value]', 'Rackspace Api Key', '')
  .option('-r, --region [value]', 'Rackspace Region', '')
  .option('-c, --container [value]', 'Rackspace Container', '')
  .option('-f, --folder [value]', 'Remote sub-folder', '')
  .version(version)

function get_disk(){
  var options = tools.env_options({
    username:program.username,
    apikey:program.apikey,
    region:program.region,
    container:program.container,
    folder:program.folder
  });

  return bfg.rackspace(options);
}

program
  .command('upload filepath')
  .description('upload a file')
  .action(function(filepath){
    var disk = get_disk();

    process.stdin.pipe(disk.createWriteStream(filepath));
  })

program
  .command('download filepath')
  .description('download a file')
  .action(function(filepath){
    var disk = get_disk();

    disk.createReadStream(filepath).pipe(process.stdout);
    
  })

program
  .command('*')
  .action(function(command){
    console.log('bfg version ' + version + ' - \'bfg --help\' for more info');
  });

if(process.argv.length<=2){
  process.argv.push(['--help']);
}

program.parse(process.argv);