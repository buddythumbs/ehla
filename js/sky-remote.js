var SkyRemote = require('sky-remote');

var remoteControl = new SkyRemote('192.168.0.40');

// Simple - just send a command
remoteControl.press('power');

// Cool - send sequences of commands
remoteControl.press(['channelup', 'record', 'select']);

// Nice - send commands with a callback
remoteControl.press('channelup', function(err) {
    if (err) {
        console.log("Woah! Something went wrong. Cry time.");
    } else {
        console.log("I just pressed the Channel Up command.");
    };
});
