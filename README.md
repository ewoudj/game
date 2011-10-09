1970's style home console space shooter. Supports online multi-player.

How to install and run

1. Make sure Node.js is installed
2. Download the source code 
3. On the command line navigate to the downloaded source and run: node server.js
4. Use a web browser to access the url printed by step 4.

How to play

Sign in by entering a user name.
Immediately a single player game starts. 
You are the red spaceship, your opponent is the yellow spaceship. 
The winner is the first player that destroys 10 opponent spaceships.
If your spaceship is destroyed click a asteroid of your color and drag to spawn a new spaceship.

Controls:

Move: Mouse movement guides your spaceship (the ship will fly in the direction of your mouse pointer).
Shoot Left click fires your laser

F1: Start single player game
F2: Start multi player game 
F3: Volume down
F4: Volume up
F5: Toggle mute
F6: Start AI versus AI game
F7: Toggle chat

Adding your AI

The example AI (heuristic and prioritizing) shows you how to implement the AI. Essentially it is a function that gets called in the context of the spaceship ('this' will be the player ship).

To register the AI: make sure it gets 'required' in the ship.js file, add an appropriate script element to index.html. (Eventually this will be replaced with a plugin system.)

Credits:

Code:
All the contributors to this project
Node (chat) team: https://github.com/ry/node_chat
SoundManager2 team: http://www.schillmania.com/projects/soundmanager2/
JQuery team: http://jquery.com/

Font:
CBMTTF team: http://kofler.dot.at/c64/
Font Squirrel fontface generator team: http://www.fontsquirrel.com/fontface/generator

Sound effects:
HardPCM team: http://hardpcmtechnologies.blogspot.com/
HardPCM freesound team: http://www.freesound.org/people/HardPCM/


 


	