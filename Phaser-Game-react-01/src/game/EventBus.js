import Phaser from 'phaser'

// A tiny event emitter used to bridge the Phaser game and the React UI.
// Phaser scenes emit events (score changed, game over, ...) and React
// components subscribe to them to update the HUD.
export const EventBus = new Phaser.Events.EventEmitter()
