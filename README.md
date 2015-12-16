

# nodedoy

This project is meant to be a playground to play with node.js, Jenkin's JSON API
and executing actions on job's status changes'. But if you find it useful and want
to join the game, you're very welcome.

## Usage

Customise `nodedoy.json` to your needs and run node with `node nodedoy.js`.

## Developing

You can add new services to poll creating new modules under `modules` folder. Currently
all job's status are stored solely in memory but this might be extended to support
other storages in the future.

