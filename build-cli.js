const execSync = require("child_process").execSync;
const fs = require("fs");

let args = process.argv;
args.splice(0, 2);

const command = args[0].toLowerCase().trim();
let exitCode;
switch (command) {
    case "build-lib":
        exitCode = buildLib(args[1]);
        break;
    case "test":
        exitCode = testAll();
        break;
    case "test-lib":
        exitCode = testLib(args[1]);
        break;
    case "publish-lib":
        exitCode = publishLib(args[1]);
        break;
    default:
        console.error(`Unknown command ${command}`);
        exitCode = 1;
        break;
}
process.exit(exitCode);

function buildLib(libName) {
    testLib(libName);
    console.log(`Building ${libName}...`);
    let opts;
    opts = {
        cwd: `${__dirname}`,
        stdio: [0, 1, 2],
    };
    try {
        execSync(`ng build ${libName} --prod`, opts);
    } catch (err) {
        console.log("ec", exitCode);
        console.error(`Error building project, check output above!`);
        return 1;
    }
    opts = {
        cwd: __dirname,
        stdio: [0, 1, 2],
    };
    console.log(`Updating package.json version and copying package.json.`);
    try {
        const jsonFile = `${__dirname}\\projects\\${libName}\\package.json`;
        let packageJsonStr = fs.readFileSync(jsonFile, {
            encoding: 'utf-8'
        });
        const packageJson = JSON.parse(packageJsonStr);
        const version = (packageJson.version || "1.0.0").split(".");
        version[2] = parseInt(version[2]) + 1;
        packageJson.version = version.join(".");
        console.log(`New package.json version is ${packageJson.version}.`);
        packageJsonStr = JSON.stringify(packageJson, null, 4);
        fs.writeFileSync(jsonFile, packageJsonStr);

    } catch (err) {
        console.error(`Error copying package.json!`, err);
        return 1;
    }
    return 0;
}

function testLib(libName) {
    console.log(`Testing ${libName}...`);
    let opts;
    opts = {
        cwd: `${__dirname}`,
        stdio: [0, 1, 2],
    };
    try {
        execSync(`ng test ${libName} --watch=false --browsers=ChromeHeadless --code-coverage=true`, opts);
    } catch (err) {
        console.error(`Error running tests, check output above!`);
        return 1;
    }
    return 0;
}

function testAll() {
    console.log(`Testing all libraries...`);
    const projectsDir = __dirname+"/projects";
    const dirs = fs.readdirSync(projectsDir).filter(dir => {
        return fs.statSync(`${projectsDir}/${dir}`).isDirectory();
    });
    console.log(`Found ${dirs.join(", ")}`);

    dirs.forEach(dir => {
        testLib(dir);
    });

    //combine all
    const opts = {
        cwd: `${__dirname}`,
        stdio: [0, 1, 2],
    };
    try {
        execSync(`node ./node_modules/istanbul/lib/cli.js report --dir ./coverage/ html`, opts);
        execSync(`node ./node_modules/istanbul/lib/cli.js report --dir ./coverage/ json`, opts);
    } catch (err) {
        console.log("ec", exitCode);
        console.error(`Error building project, check output above!`);
        return 1;
    }

}

function publishLib(libName) {
    console.log(`Publishing ${libName}...`);
    const buildCode = buildLib(libName);
    if (buildCode !== 0) {
        return buildCode;
    }
    let opts;
    opts = {
        cwd: `${__dirname}\\dist\\${libName}`,
        stdio: [0, 1, 2],
    };

    try {
        execSync(`npm publish  --access public`, opts);
    } catch (err) {
        console.error(`Error publishing, check output above!`);
        return 1;
    }
    return 0;
}