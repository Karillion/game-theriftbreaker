const path = require('path');
const winapi = require('winapi-bindings');
const { fs, util } = require('vortex-api');

// game variables
const GAME_ID = 'theriftbreaker';
const GAME_NAME = 'The Riftbreaker';

// store variables
const EPICAPP_ID = '5bf44beb2a1f437696f637071203be7c';
const GOGAPP_ID = '2147483111';
const STEAMAPP_ID = '780310';

/**
 * Entry point
 */
function main(context) {
  context.registerGame({
    id: GAME_ID,
    name: GAME_NAME,
    mergeMods: true,
    queryPath: findGame,
    queryModPath: () => 'data',
    logo: 'gameart.jpg',
    executable: (discoveryPath) => {
      const winPath = 'bin/riftbreaker_win_release.exe';
      const winStorePath = 'riftbreaker_winstore_release.exe';

      if (
        discoveryPath !== undefined &&
        getPathExists(path.join(discoveryPath, winStorePath))
      )
        return winStorePath;

      return winPath;
    },
    requiredFiles: ['packs/01_win_data.zip'],
    supportedTools: [],
    setup: prepareForModding,
    environment: {
      SteamAPPId: STEAMAPP_ID
    },
    details: {
      epicAppId: EPICAPP_ID,
      gogAppId: GOGAPP_ID,
      steamAppId: STEAMAPP_ID
    }
  });

  return true;
}

/**
 * Gets whether the specified path exists.
 */
function getPathExists(path) {
  try {
    fs.statSync(path);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Find the game installation location.
 */
function findGame() {
  try {
    const instPath = winapi.RegGetValue(
      'HKEY_LOCAL_MACHINE',
      'SOFTWARE\\WOW6432Node\\GOG.com\\Games\\' + GOGAPP_ID,
      'PATH'
    );
    if (!instPath) {
      throw new Error('empty registry key');
    }
    return Promise.resolve(instPath.value);
  } catch (err) {
    return util.GameStoreHelper.findByAppId([
      STEAMAPP_ID,
      GOGAPP_ID,
      EPICAPP_ID
    ]).then((game) => game.gamePath);
  }
}

/**
 * Ensure the game is ready to be modified.
 */
function prepareForModding(discovery) {
  return fs.ensureDirWritableAsync(path.join(discovery.path, 'data'));
}

module.exports = {
  default: main
};
