#!/usr/bin/node
var Configstore = require('configstore');
var Monitor = require('svnmonitor');
var _ = require('underscore');
var moment = require('moment');
var exec = require('child_process').exec;
var prompt = require('prompt');
var argv = require('optimist').argv;

prompt.message = '';
prompt.delimiter = '';

var conf = new Configstore('wazza');

var user = conf.get('username');
var pwd = conf.get('password');

var svninfos = [];
var url = '';
var localRevision = 0;


var setup = function(callback) {
    prompt.start();
    prompt.get([{
        name: 'username',
        description: 'Username: ',
        required: true
      }, {
        name: 'password',
        description: 'Password: ',
        hidden: true,
        conform: function (value) {
          return true;
        }
      }], function (err, result) {
        conf.set('username', result.username);
        conf.set('password', result.password);

        console.log('Settings stored in', conf.path);
        if (callback) {
            callback();
        }
    });
};


/**
 * Extract the value for the given key from the 'svn info' result string
 * @param  {String} key, One of the 'svn info' key (URL, Revision, etc...)
 * 
 * @return {String}
 */
var getInfo = function(key) {
    var urlLine = _.find(svninfos, function(line) {
        return line.indexOf(key) === 0;
    });

    return urlLine.split(': ')[1];
};

var displayUpdates = function(nbCommits) {
    console.log();
    console.log(' Looking for updates on');
    console.log('', url.bold);
    console.log(' Local revision :', localRevision.toString().bold, '\n');
    var svnPortalMon = new Monitor(url, user, pwd);

    svnPortalMon.getLatestCommits(nbCommits, function(err, logs) {
            if(err){
                console.log('Error: ' + err);
                return;
            }

            var nbUpdates = 0;

            _.each(logs, function(log) {
                if (parseInt(log.revision, 10) >  localRevision) {
                    var header = moment(log.date, "YYYY-MM-DD HH:mm:ss Z").fromNow() + ', ' + 'revision ' + log.revision;
                    console.log('', header.grey.bold);
                    console.log(' \\o/'.bold, log.author.trim().green.bold.underline, log.message.split('\n').join(' '));
                    console.log('\n');
                    nbUpdates++;
                }
            });

            if (nbUpdates === 0) {
                console.log(' You\'re up to date !'.green.bold);
            } else {
                console.log('------------------------------');
                console.log(' ',nbUpdates.toString().red.bold, 'updates available !'.blue.bold);
                console.log('------------------------------');
            }
    });
};

var run = function() {
    // Get folder SVN URL and local revision
    exec('svn info', function (error, stdout, stderr) {
        if (error) {
            console.log(error);
            console.log('\n');
            return;
        }

        svninfos = stdout.split('\n');
        url = getInfo('URL');
        localRevision = parseInt(getInfo('Revision'), 10);
        // FIXME: Provide a limit to avoid 'Error: Error: stdout maxBuffer exceeded.'
        displayUpdates(200);
    });
};

// Go go go !
var wantSetup = _.find(argv._,function(arg) {
    return arg === 'setup';
});

if (wantSetup) {
    setup();
} else if (!user || !pwd) {
    console.log("Please set your SVN credentials.");
    setup(function() {
        run();
    });
} else {
    run();
}
