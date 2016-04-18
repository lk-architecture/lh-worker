import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import step from "utils/step";

chai.use(sinonChai);

describe("step", () => {

    it("returns a function", () => {
        const ret = step();
        expect(ret).to.be.a("function");
    });

});

describe("the function returned by step", () => {

    const log = {
        info: sinon.spy(),
        fatal: sinon.spy()
    };

    before(() => {
        step.__Rewire__("log", log);
        sinon.stub(process, "exit");
    });
    after(() => {
        step.__ResetDependency__("log");
        process.exit.restore();
    });
    beforeEach(() => {
        log.info.reset();
        log.fatal.reset();
        process.exit.reset();
    });

    it("calls with its own arguments the stepFunction passed to step", () => {
        const stepFunction = sinon.spy();
        const ret = step("Name", stepFunction);
        ret(0, 1, 2);
        expect(stepFunction).to.have.callCount(1);
        expect(stepFunction).to.have.been.calledWith(0, 1, 2);
    });

    it("exits the process if stepFunction throws", () => {
        const stepFunction = sinon.stub().throws();
        const ret = step("Name", stepFunction);
        ret(0, 1, 2);
        expect(process.exit).to.have.callCount(1);
        expect(process.exit).to.have.been.calledWith(1);
    });

    it("logs on step start [CASE: stepFunction doesn't throw]", () => {
        const stepFunction = sinon.spy();
        const ret = step("Name", stepFunction);
        ret(0, 1, 2);
        expect(log.info).to.have.been.calledWith("Name started", {args: [0, 1, 2]});
    });

    it("logs on step start [CASE: stepFunction throws]", () => {
        const stepFunction = sinon.stub().throws();
        const ret = step("Name", stepFunction);
        ret(0, 1, 2);
        expect(log.info).to.have.been.calledWith("Name started", {args: [0, 1, 2]});
    });

    it("logs on step success", () => {
        const stepFunction = sinon.spy();
        const ret = step("Name", stepFunction);
        ret(0, 1, 2);
        expect(log.info).to.have.been.calledWith("Name succeeded");
    });

    it("logs on step failure", () => {
        const err = new Error();
        const stepFunction = sinon.stub().throws(err);
        const ret = step("Name", stepFunction);
        ret(0, 1, 2);
        expect(log.fatal).to.have.callCount(1);
        expect(log.fatal).to.have.been.calledWith(err, "Name failed");
    });

});
