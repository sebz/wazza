wazza
=====

Small Nodejs script telling you *"what's up"* in your SVN repository. Basically what you'll get if you *svn up*.

## Instructions
Just clone this repo, get the necessary dependencies:  
`npm install`

Symlink it to add it to the PATH:  
`ln -s wazza.js ~/apps/wazza` (where *~/apps* folder is already in the PATH)

Go to a folder under revision control and invoke it: `wazza`

The first time you will be asked to provide your SVN credentials.  
To change them afterwards just call `wazza setup`.




