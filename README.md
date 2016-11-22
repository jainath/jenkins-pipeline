# jenkins-pipeline
Execute groovy pipeline code in remote jenkins server and monitor the output in client console(I prefer [Atom](https://atom.io/) editor).

![jenkins-pipeline](https://raw.githubusercontent.com/jacob4madhu/jenkins-pipeline/master/help/atom-preview.png)

Install this package globally
```
npm install -g jenkins-pipeline
```
Create pipeline job in jenkins

![create-pipeline-job](https://raw.githubusercontent.com/jacob4madhu/jenkins-pipeline/master/help/pipeline-job.png)

Command
```
jenkins-pipeline --file <path to groovy file> --url <path-to-pipeline-job> --credentials <jenkins-username>:<jenkins-password>
```
Example command
```
jenkins-pipeline --file sample.groovy --url http://localhost:8080/job/test-pipeline/ --credentials admin:abc123
```

## Atom editor configuration
To configure this command in [Atom Editor](https://atom.io/), make sure you have [build](https://atom.io/packages/build) package installed in your atom editor and add `.atom-build.yml` file in project folder with below yml code. Sample [file](https://github.com/jacob4madhu/jenkins-pipeline/blob/master/.atom-build.yml) is added in this repository for referance. For more information on how to build, please check this [link](https://atom.io/packages/build)

Save this as `.atom-build.yml`, and build(<kbd>ctrl</kbd>+<kbd>Alt</kbd>+<kbd>b</kbd>) your groovy file.

```
cmd: "jenkins-pipeline"
args:
  - "--file {FILE_ACTIVE}"
  - "--url http://localhost:8080/job/test-pipeline/"
  - "--credentials admin:abc123"
sh: true
```


## Sublime editor configuration
To configure this command in [Sublime Text Editor](https://www.sublimetext.com/), make sure you have sublimetext 3 installed.
Create a build system in sublime.
Go to Tools >> Build System >> New Build System... (this menu structure is for Ubuntu, may have different menu structure for windows/mac)

Save this as `jenkins-pipeline.sublime-build`, and buid(<kbd>ctrl</kbd> + <kbd>b</kbd>) your groovy file.
```
{
    "cmd": ["jenkins-pipeline --file $file_name --url http://localhost:8080/job/test-pipeline/ --credentials admin:abc123"],
    "shell" : true
}
```


## Note
Groovy pipeline code should be saved as with `.groovy` extension
