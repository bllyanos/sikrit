const { Command } = require("commander");
const program = new Command();
const fs = require("fs");
const os = require("os");
const path = require("path");

program.version("1.0.1");

const alphabet = "abcdefghijklmnopqrstuvwxyz";
const alphabetUpper = alphabet.toUpperCase();
const numeric = "1234567890";
const symbols = "~!@#$%^&*()_+";
const stringRange = alphabet + alphabetUpper + numeric + symbols;

/**
 * @param {number} max
 */
function random(max) {
  return Math.floor(Math.random() * max);
}

/**
 * @param {string} range
 * @param {number} length
 */
function randomString(range, length) {
  const rangeLength = range.length;
  let finalString = "";
  for (let i = 0; i < length; i++) {
    const charIndex = random(rangeLength);
    const randomStr = range.charAt(charIndex);
    finalString += randomStr;
  }
  return finalString;
}

/**
 *
 */
function readSavedData() {
  const homedir = os.homedir();
  const isConfigFolderExists = fs.existsSync(path.join(homedir, ".sikrit"));
  if (!isConfigFolderExists) {
    fs.mkdirSync(path.join(homedir, ".sikrit"));
  }

  const isFileExists = fs.existsSync(
    path.join(homedir, ".sikrit", "data.json")
  );
  if (!isFileExists) {
    fs.writeFileSync(
      path.join(homedir, ".sikrit", "data.json"),
      JSON.stringify({}),
      { encoding: "utf-8" }
    );
    return {};
  }
  const savedData = fs.readFileSync(
    path.join(homedir, ".sikrit", "data.json"),
    "utf-8"
  );
  try {
    return JSON.parse(savedData);
  } catch (err) {
    return {};
  }
}

function saveData(obj) {
  const homedir = os.homedir();
  fs.writeFileSync(
    path.join(homedir, ".sikrit", "data.json"),
    JSON.stringify(obj),
    { encoding: "utf-8" }
  );
}

async function main() {
  const defaultLength = 12;
  const saved = readSavedData();

  program
    .command("generate <name>")
    .description("generate")
    .option("-l, --length <length>", "specify length")
    .action((name, options) => {
      if (saved[name]) {
        return console.log("Error: DUPLICATE NAME !!!");
      }
      const length = options.length ? Number(options.length) : defaultLength;
      const generated = randomString(stringRange, length);
      saved[name] = generated;
      saveData(saved);
      console.log("YOUR PASSWORD IS:", generated);
    });

  program.command("get <name>").action((name) => {
    console.log("YOUR PASSWORD IS:", saved[name]);
  });

  program.command("list").action(() => {
    if (!Object.keys(saved).length) {
      console.table([{ name: null, length: null }]);
      return console.log("-- VAULT EMPTY");
    }
    console.table(
      Object.keys(saved).map((k) => {
        return {
          name: k,
          length: saved[k].length,
        };
      })
    );
  });

  program.command("remove <name>").action((name) => {
    saved[name] = undefined;
    saveData(saved);
    console.log("PASSWORD REMOVED:", name);
  });

  program.parse(process.argv);
}

main();
