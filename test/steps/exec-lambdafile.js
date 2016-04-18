import chai, {expect} from "chai";
import {range} from "ramda";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import execLambdafileModule from "steps/exec-lambdafile";

chai.use(sinonChai);

describe("getRunCommands", () => {

    const getRunCommands = execLambdafileModule.__GetDependency__("getRunCommands");

    it("exrtacts commands from RUN lines in the Lambdafile", () => {
        const Lambdafile = [
            "FROM node",
            "MAINTEINER Foo Bar <foo@example.com>",
            "# Comment",
            "RUN command",
            "RUN another command",
            "# Another comment",
            "RUN a third command",
            "RUN a fourth command containing the keyword RUN (and then some)",
            "RUN a fifth command containing the keyword RUN"
        ].join("\n");
        const result = getRunCommands(Lambdafile);
        expect(result).to.deep.equal([
            "command",
            "another command",
            "a third command",
            "a fourth command containing the keyword RUN (and then some)",
            "a fifth command containing the keyword RUN"
        ]);
    });

});

describe("execCommand", () => {

    const execCommand = execLambdafileModule.__GetDependency__("execCommand");

    after(() => {
        execLambdafileModule.__ResetDependency__("execSync");
    });

    it("execs the supplied command", () => {
        const execSync = sinon.stub().returns(new Buffer(""));
        execLambdafileModule.__Rewire__("execSync", execSync);
        execCommand("command");
        expect(execSync).to.have.been.calledWith("command");
    });

    it("when the command succeeds, returns an object with command, stdout, and status (0)", () => {
        const execSync = sinon.stub().returns(new Buffer("stdout"));
        execLambdafileModule.__Rewire__("execSync", execSync);
        const ret = execCommand("command");
        expect(ret).to.deep.equal({
            command: "command",
            stdout: "stdout",
            status: 0
        });
    });

    it("when the command fails, returns an object with command, stdout, and status", () => {
        const execSync = sinon.stub().throws({
            stdout: new Buffer("stdout"),
            status: 1
        });
        execLambdafileModule.__Rewire__("execSync", execSync);
        const ret = execCommand("command");
        expect(ret).to.deep.equal({
            command: "command",
            stdout: "stdout",
            status: 1
        });
    });

});

describe("execCommands", () => {

    const execCommands = execLambdafileModule.__GetDependency__("execCommands");
    const commands = [
        "first",
        "second",
        "third",
        "fourth",
        "fifth"
    ];

    after(() => {
        execLambdafileModule.__ResetDependency__("execCommand");
    });

    it("execs each command in the supplied list up until the first failing one [CASE: nth failing]", () => {
        range(0, commands.length).forEach(n => {
            const execCommand = sinon.spy(command => (
                command === commands[n] ? {status: 1} : {status: 0}
            ));
            execLambdafileModule.__Rewire__("execCommand", execCommand);
            execCommands(commands);
            expect(execCommand).to.have.callCount(n + 1);
            commands.forEach((command, index) => {
                if (index <= n) {
                    expect(execCommand).to.have.been.calledWith(command);
                } else {
                    expect(execCommand).not.to.have.been.calledWith(command);
                }
            });
        });
    });

    it("execs each command in the supplied list up until the first failing one [CASE: none failing]", () => {
        const execCommand = sinon.stub().returns({status: 0});
        execLambdafileModule.__Rewire__("execCommand", execCommand);
        execCommands(commands);
        expect(execCommand).to.have.callCount(commands.length);
        commands.forEach(command => {
            expect(execCommand).to.have.been.calledWith(command);
        });
    });

    it("returns the list of results for the executed commands [CASE: nth failing]", () => {
        range(0, commands.length).forEach(n => {
            const execCommand = sinon.spy(command => (
                command === commands[n] ? {status: 1} : {status: 0}
            ));
            execLambdafileModule.__Rewire__("execCommand", execCommand);
            const ret = execCommands(commands);
            const expected = range(0, n + 1).map(index => (
                index === n ? {status: 1} : {status: 0}
            ));
            expect(ret).to.deep.equal(expected);
        });
    });

    it("returns the list of results for the executed commands [CASE: none failing]", () => {
        const execCommand = sinon.stub().returns({status: 0});
        execLambdafileModule.__Rewire__("execCommand", execCommand);
        const ret = execCommands(commands);
        const expected = commands.map(() => ({status: 0}));
        expect(ret).to.deep.equal(expected);
    });

});

describe("bundleExists", () => {

    const bundleExists = execLambdafileModule.__GetDependency__("bundleExists");

    it("returns true if statSync doesn't throw", () => {
        const statSync = sinon.spy();
        execLambdafileModule.__Rewire__("statSync", statSync);
        const ret = bundleExists("existing");
        expect(ret).to.equal(true);
    });

    it("returns false if statSync throws", () => {
        const statSync = sinon.stub().throws();
        execLambdafileModule.__Rewire__("statSync", statSync);
        const ret = bundleExists("existing");
        expect(ret).to.equal(false);
    });

});

describe("getResult", () => {

    const getResult = execLambdafileModule.__GetDependency__("getResult");
    const Lambdafile = [
        "FROM node",
        "MAINTEINER Foo Bar <foo@example.com>",
        "# Comment",
        "RUN command",
        "RUN another command",
        "# Another comment",
        "RUN a third command",
        "RUN a fourth command containing the keyword RUN (and then some)",
        "RUN a fifth command containing the keyword RUN"
    ].join("\n");

    describe("returns an object", () => {

        it("describing the Lambdafile execution", () => {
            const bundleExists = sinon.stub().returns(true);
            execLambdafileModule.__Rewire__("bundleExists", bundleExists);
            const runResults = [{status: 0}];
            const ret = getResult(Lambdafile, runResults);
            expect(ret).to.deep.equal({
                Lambdafile: Lambdafile,
                runResults: runResults,
                status: 0,
                error: null
            });
        });

        it("with status 0 and error null if all runResults have a 0 status and bundleExists returns true", () => {
            const bundleExists = sinon.stub().returns(true);
            execLambdafileModule.__Rewire__("bundleExists", bundleExists);
            const runResults = [{status: 0}];
            const ret = getResult(Lambdafile, runResults);
            expect(ret).to.have.property("status", 0);
            expect(ret).to.have.property("error", null);
        });

        it("with status 1 and error `No bundle generated` if all runResults have a 0 status but bundleExists returns false", () => {
            const bundleExists = sinon.stub().returns(false);
            execLambdafileModule.__Rewire__("bundleExists", bundleExists);
            const runResults = [{status: 0}];
            const ret = getResult(Lambdafile, runResults);
            expect(ret).to.have.property("status", 1);
            expect(ret).to.have.property("error", "No bundle generated");
        });

        it("with status 1 and error `Execution failed` if the last runResults have a status !== 0", () => {
            const bundleExists = sinon.stub().returns(true);
            execLambdafileModule.__Rewire__("bundleExists", bundleExists);
            const runResults = [{status: 1}];
            const ret = getResult(Lambdafile, runResults);
            expect(ret).to.have.property("status", 1);
            expect(ret).to.have.property("error", "Execution failed");
        });

    });

});

describe("execLambdafile", () => {

    const execLambdafile = execLambdafileModule.__GetDependency__("execLambdafile");
    const Lambdafile = [
        "FROM node",
        "MAINTEINER Foo Bar <foo@example.com>",
        "# Comment",
        "RUN command",
        "RUN another command",
        "# Another comment",
        "RUN a third command",
        "RUN a fourth command containing the keyword RUN (and then some)",
        "RUN a fifth command containing the keyword RUN"
    ].join("\n");
    const readFileSync = sinon.stub().returns(Lambdafile);
    const execSync = sinon.stub().returns(new Buffer("stdout"));
    const statSync = sinon.stub().returns(true);
    const writeFileSync = sinon.spy();

    before(() => {
        execLambdafileModule.__Rewire__("readFileSync", readFileSync);
        execLambdafileModule.__Rewire__("execSync", execSync);
        execLambdafileModule.__Rewire__("statSync", statSync);
        execLambdafileModule.__Rewire__("writeFileSync", writeFileSync);
    });
    after(() => {
        execLambdafileModule.__ResetDependency__("readFileSync");
        execLambdafileModule.__ResetDependency__("execSync");
        execLambdafileModule.__ResetDependency__("statSync");
        execLambdafileModule.__ResetDependency__("writeFileSync");
    });
    beforeEach(() => {
        readFileSync.reset();
        execSync.reset();
        statSync.reset();
        writeFileSync.reset();
    });

    it("reads the Lambdafile from the file system", () => {
        execLambdafile();
        expect(readFileSync).to.have.callCount(1);
        expect(readFileSync).to.have.been.calledWith("Lambdafile", "utf8");
    });

    it("execs RUN commands", () => {
        execLambdafile();
        expect(execSync).to.have.callCount(5);
        expect(execSync).to.have.been.calledWith("command");
        expect(execSync).to.have.been.calledWith("another command");
        expect(execSync).to.have.been.calledWith("a third command");
        expect(execSync).to.have.been.calledWith("a fourth command containing the keyword RUN (and then some)");
        expect(execSync).to.have.been.calledWith("a fifth command containing the keyword RUN");
    });

    it("writes the execution result to the file system", () => {
        const expectedRunResults = [
            "command",
            "another command",
            "a third command",
            "a fourth command containing the keyword RUN (and then some)",
            "a fifth command containing the keyword RUN"
        ].map(command => ({
            command: command,
            status: 0,
            stdout: "stdout"
        }));
        execLambdafile();
        expect(writeFileSync).to.have.callCount(1);
        expect(writeFileSync).to.have.been.calledWith("Lambdafile-exec-result.json");
        const actual = JSON.parse(writeFileSync.getCall(0).args[1]);
        expect(actual).to.deep.equal({
            Lambdafile: Lambdafile,
            status: 0,
            error: null,
            runResults: expectedRunResults
        });
    });

});
