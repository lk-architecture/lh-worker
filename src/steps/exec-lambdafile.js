import {execSync} from "child_process";
import {readFileSync, statSync, writeFileSync} from "fs";
import last from "lodash.last";
import * as config from "../config";
import step from "../utils/step";

function getRunCommands (Lambdafile) {
    const prefix = "RUN ";
    const prefixRegex = new RegExp(`^${prefix}`, "i");
    return Lambdafile
        .split("\n")
        .filter(line => prefixRegex.test(line))
        .map(line => line.slice(prefix.length));
}

function execCommand (command) {
    const result = {command};
    try {
        result.stdout = execSync(command).toString();
        result.status = 0;
    } catch (err) {
        result.stdout = err.stdout.toString();
        result.status = err.status;
    }
    return result;
}

function execCommands (commands) {
    const results = [];
    for (const command of commands) {
        const result = execCommand(command);
        results.push(result);
        if (result.status !== 0) {
            break;
        }
    }
    return results;
}

function bundleExists () {
    try {
        statSync(config.BUNDLE_FILENAME);
        return true;
    } catch (ignore) {
        return false;
    }
}

function getResult (Lambdafile, runResults) {
    const execSucceeded = (last(runResults).status === 0);
    const bundleGenerated = bundleExists();
    return {
        Lambdafile: Lambdafile,
        runResults: runResults,
        status: (
            execSucceeded && bundleGenerated ?
            0 :
            1
        ),
        error: (
            execSucceeded ?
            (bundleGenerated ?
                null :
                "No bundle generated"
            ) :
            "Execution failed"
        )
    };
}

function execLambdafile () {
    const Lambdafile = readFileSync(config.LAMBDAFILE_FILENAME, "utf8");
    const runCommands = getRunCommands(Lambdafile);
    const runResults = execCommands(runCommands);
    const result = getResult(Lambdafile, runResults);
    writeFileSync(config.LAMBDAFILE_EXEC_LOG_FILENAME, JSON.stringify(result));
}

export default step("Lambdafile execution", execLambdafile);
