const path = require("path");
const winapi = require("winapi-bindings");
const { fs, log, util } = require("vortex-api");

// game variables
const GAME_ID = "theriftbreaker";
const GAME_NAME = "The Riftbreaker";
const GAME_EXECUTABLE = "bin/riftbreaker_win_release.exe";

// store variables
const STEAMAPP_ID = "780310";
const GOGAPP_ID = "2147483111";

function main(context) {
  context.registerGame({
    id: GAME_ID,
    name: GAME_NAME,
    mergeMods: true,
    queryPath: findGame,
    queryModPath: () => "packs",
    logo: "gameart.jpg",
    executable: () => GAME_EXECUTABLE,
    requiredFiles: [GAME_EXECUTABLE],
    supportedTools: [],
    setup: prepareForModding,
    environment: {
      SteamAPPId: STEAMAPP_ID,
    },
    details: {
      steamAppId: STEAMAPP_ID,
      gogAppId: GOGAPP_ID,
    },
  });

  context.registerInstaller(
    "theriftbreaker-mod",
    25,
    testSupportedContent,
    installContent
  );

  return true;
}

function findGame() {
  try {
    const instPath = winapi.RegGetValue(
      "HKEY_LOCAL_MACHINE",
      "SOFTWARE\\WOW6432Node\\GOG.com\\Games\\" + GOGAPP_ID,
      "PATH"
    );
    if (!instPath) {
      throw new Error("empty registry key");
    }
    return Promise.resolve(instPath.value);
  } catch (err) {
    return util.GameStoreHelper.findByAppId([STEAMAPP_ID, GOGAPP_ID]).then(
      (game) => game.gamePath
    );
  }
}

async function installContent(files, destinationPath) {
  const szip = new util.SevenZip();
  const archiveName = path.basename(destinationPath, ".installing") + ".zip";
  const archivePath = path.join(destinationPath, archiveName);
  const rootRelPaths = await fs.readdirAsync(destinationPath);

  await szip.add(
    archivePath,
    rootRelPaths.map((relPath) => path.join(destinationPath, relPath)),
    { raw: ["-r"] }
  );

  const instructions = [
    {
      type: "copy",
      source: archiveName,
      destination: archiveName,
    },
  ];

  return Promise.resolve({ instructions });
}

function testSupportedContent(_, gameId) {
  return Promise.resolve({
    supported: gameId === GAME_ID,
    requiredFiles: [],
  });
}

function prepareForModding(discovery) {
  return fs.ensureDirWritableAsync(discovery.path);
}

module.exports = {
  default: main,
};
