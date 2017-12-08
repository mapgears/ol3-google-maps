# Developing on Windows

## Recommended tools for development
These tools are recommended when developing on Windows:
* Cygwin with:
    * Python 2.6 or 2.7
    * Make
* Git Bash

Alternatively, you can use [Ubuntu Bash](https://msdn.microsoft.com/en-us/commandline/wsl/install-win10) for **Windows 10** machines. In that case, skip to the installation guide for Windows 10 below.

### Development dependencies

The minimum requirements are:

* GNU Make
* Git
* [Node.js](http://nodejs.org/) (4.2.x or higher)
* Python 2.6 or 2.7
* Java 7 (JRE and JDK)

The executables `git`, `node`, and `java` should be in your `PATH`.

Install pip through Cygwin:

    $ easy_install-a.b pip
 
Where a.b is either 2.6 or 2.7 depending on the chosen Python version.

Also, through Cygwin, install virtualenv:
    
    $ pip install virtualenv

To install the Node.js dependencies run

    $ npm install

## Installation guide for Windows 10

* Download [NodeJS](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions) for Ubuntu.

* Install Java:
    
        $ sudo apt-get install default-jre

* Install Python:

        $ sudo apt-get install build-essential
        $ sudo apt-get install libreadline-gplv2-dev libncursesw5-dev libssl-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev libbz2-dev
        $ wget https://www.python.org/ftp/python/2.7.13/Python-2.7.13.tgz
        $ tar -xvf Python-2.7.13.tgz
        $ cd Python-2.7.13
        $ sudo ./configure
        $ sudo make install
        $ sudo make altinstall

* Install dos2unix to convert task files in a Unix format:

        $ sudo apt install dos2unix
        $ dos2unix tasks/*.sh

 > If you use Visual Studio Code for development, [learn](https://code.visualstudio.com/docs/editor/integrated-terminal) how to set the Ubuntu Bash as your integrated terminal.

> Dos2unix is needed because new line characters in **tasks** files are not correctly recognized and they generate a parse error when running `make serve`.


## Working with the build tool on Windows
Should work as described in DEVELOPING.md.

