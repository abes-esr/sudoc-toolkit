'use strict';
const electron = require('electron')
const remote = electron.remote;

window.BISELECTRON = {
    // ----------------------------------------------------
    // Add modules here
    // ----------------------------------------------------
    fs : require('fs'),
    path : require('path'),
    os : require('os'),
    axios : require("axios"),
    parse : require("csv-parse"),
    Papa : require("papaparse"),
    _ : require('underscore'), 
    CanvasJS : require('./renderer-process/canvasjs.min'),
    ipc : electron.ipcRenderer,
    dialog : remote.require('electron').dialog,
    remote : remote,
    Buffer : Buffer,
};