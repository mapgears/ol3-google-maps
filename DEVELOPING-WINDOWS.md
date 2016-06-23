# Developing on Windows

## Recommended tools for development
These tools are recommended when developing on Windows:
* Cygwin with:
    * Python 2.6 or 2.7
    * Make
* Git Bash

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


## Working with the build tool on Windows
Should work as described in DEVELOPING.md.

