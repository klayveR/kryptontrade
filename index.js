'use strict';

const ioHook = require('iohook');
const clipboardy = require('clipboardy');

const NinjaAPI = require("poe-ninja-api-manager");
const Helpers = require("./modules/helpers.js");
const GUI = require("./modules/gui.js");

class XenonTrade {
  constructor() {
    this.updating = false;
    this.loading = false;
    this.config = {league: 'Standard'}

    this.gui = new GUI(this, 300);
    this.ninjaAPI = new NinjaAPI({
      path: './',
      league: this.config.league
    });

    this.initialize();
  }

  initialize() {
    this.registerHotkeys();
  }

  registerHotkeys() {
    const clipboardShortcut = ioHook.registerShortcut([29, 46], (keys) => {
      this.onClipboard();
    });
  }

  updateNinja() {
    if(!this.updating && !this.loading) {
      this.updating = true;
      var updateEntry = this.gui.addTextEntry('Updating...', this.config.league);

      this.ninjaAPI.update()
      .then((result) => {
        var entry = this.gui.addTextEntry('Update successful!', this.config.league, 'fa-check-circle green');
        entry.enableAutoClose(5);
      })
      .catch((error) => {
        this.gui.addTextEntry('Update failed!', error.message, 'fa-exclamation-triangle yellow');
      })
      .then(() => {
        updateEntry.close();
        this.updating = false;
      })
    }
  }

  loadNinja() {
    if(!this.updating && !this.loading) {
      this.loading = true;

      this.ninjaAPI.load()
      .then((success) => {
        console.log("Loaded poe.ninja data:", success);
      })
      .catch((error) => {
        console.error('Failed to load poe.ninja data', error.code);
        this.handleNinjaLoadError(error);
      })
      .then(() => {
        this.loading = false;
      })
    }
  }

  handleNinjaLoadError(error) {
    this.loading = false;

    // Only show error entry if the file exists and the data couldn't be loaded
    if(error.code !== 'ENOENT') {
      this.gui.addTextEntry('Failed to load data!', error.message, 'fa-exclamation-triangle yellow');
    }

    this.updateNinja();
  }
}

var app = new XenonTrade();
