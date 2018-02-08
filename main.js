var electron = require("electron");
var url = require("url");
var path = require("path");
var constants = require("./src/constants");

var app = electron.app;
var BrowserWindow = electron.BrowserView;
var Menu = electron.Menu;
var Tray = electron.Tray;
var ICONS = constants.ICONS;
var ipc = electron.ipcMain;
var win;
var renderer;

// App Events
app.on("window-all-closed", app.quit);
app.on("ready", initProcess);

/*
  * Init the app process
  * start ping
  * create tray
  * listen for ping output
*/
function initProcess() {
  var tray = createTray(ICONS.PLAY);
  win = new BrowserWindow();

  win.webContents.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  ipc.on("INIT", function(evt) {
    renderer = evt.sender;
    tray.setImage(ICONS.PAUSE);
    tray.on("click", function() {
      renderer.send("TOGGLE_STATUS");
    });
    tray.on("double click", function() {
      renderer.send("TOGGLE_STATUS");
    });
  });

  ipc.on("TOGGLE_STATUS", function(evt, isPaused) {
    tray.setImage(isPaused ? ICONS.PAUSE : ICONS.PLAY);
  });
}

/**
 * @function createTray
 * @description creates a new tray instance out of input icon path
 * @param {string} icon Path to icon
 */
function createTray(icon) {
  var tray = new Tray(icon);
  var trayMenu = createMenu();

  tray.setToolTip("Ping " + app.getVersion());

  tray.on("right-click", function() {
    showTrayMenu(tray, trayMenu);
  });

  return tray;
}

/**
 * @function showTrayMenu
 * @description Shows context menu of Tray
 * @param {Tray} tray
 * @param {Menu} menu
 */
function showTrayMenu(tray, menu) {
  tray.popUpContextMenu(menu);
}

/**
 * @function createMenu
 * @description Returns menu built for tray
 */
function createMenu() {
  return Menu.buildFromTemplate([
    {
      label: "Quit",
      click: function() {
        app.quit();
      }
    }
  ]);
}
