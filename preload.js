const electron = require('electron');
const { contextBridge } = require('electron');
const remote = require('@electron/remote');

contextBridge.exposeInMainWorld('sudocToolkitApi', {
  fs : require('fs'),
    path : require('path'),
    os : require('os'),
    Papa : require("papaparse"),
    dialog : remote.require('electron').dialog,
    Buffer : Buffer
})
