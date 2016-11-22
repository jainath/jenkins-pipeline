#!/usr/bin/env node

var rp = require('request-promise');
var Entities = require('html-entities').XmlEntities;
var log = require('single-line-log').stdout;
var program = require('commander');
var fs = require('fs');
const path = require('path');

var api;
var auth;
var currentBuild;
var buildRunning;
var groovyScript;
var job;
var version = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"))).version;
var progress = "";

program
    .version(version)
    .option('-f, --file <file>', 'Path to groovy file.')
    .option('-c, --credentials <credentials>', 'Jenkins credentials as <username>:<password> Example: admin:123')
    .option('-u, --url <url>', 'Jenkins api. Example: http://localhost:8080/job/test-pipeline/')
    .parse(process.argv);

if (!program.file || !program.credentials || !program.url) {
    console.log(program.help());
};

try {
    if (program.file.split('.').pop() != "groovy") {
        failed("Not a valid groovy file.");
    }
    groovyScript = new Entities().encode(fs.readFileSync(program.file, 'utf8'));
} catch (err) {
    failed("Failed to read " + program.file);
}

api = program.url;
auth = new Buffer(program.credentials).toString('base64');
job = fs.readFileSync(path.join(__dirname, "job.xml"), 'utf8').replace("####SCRIPT####", groovyScript);


callAPI('/config.xml', 'POST', job, 'text/xml')
    .then(function(response) {
        console.log("Updated job successfully");
        return callAPI('/api/json');
    })
    .then(function(response) {
            var body = JSON.parse(response.body);
            currentBuild = body.nextBuildNumber;
            console.log("Executing build #" + currentBuild);
            return callAPI('/build', 'POST');
    })
    .then(function(response) {
        console.log("Executed build successfully");
        return getBuildStatus()
    })
    .catch(function(err) {
        var message;
        switch (err.statusCode) {
            case 401:
                message = "Authentication failed";
                break;
            case 404:
                message = "Jenkins path not found";
                break;
            default:
                message = "Failed to execute script"
        }
        failed(message);
    });

function callAPI(path, method, body, contentType) {
    var options = {
        url: api + path,
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + auth
        },
        resolveWithFullResponse: true
    };
    if (method) {
        options.method = method;
    }
    if (body) {
        options.body = body;
    }
    if (contentType) {
        options.headers['Content-Type'] = contentType;
    }
    return rp(options);
}

function getBuildStatus() {
    return callAPI(currentBuild + '/api/json')
        .then(function(response) {
            var body = JSON.parse(response.body);
            buildRunning = Boolean(body.building);
            getBuildLog();
        })
        .catch(function(err) {
            progress = "." + progress;
            log("Waiting" + progress);
            setTimeout(getBuildStatus, 2000);
        });
}

function getBuildLog() {
    return callAPI(currentBuild + '/consoleText')
        .then(function(response) {
            log(response.body);
            if (buildRunning) {
                setTimeout(getBuildStatus, 1000);
            }
        })
        .catch(function(err) {
            console.log("Failed to get log");
        });
}

function failed(message){
    console.log(message);
    process.exit(1);
}
