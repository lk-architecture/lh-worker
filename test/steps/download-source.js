import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import downloadSourceModule from "steps/download-source";

chai.use(sinonChai);

describe("downloadSource", () => {

    const downloadSource = downloadSourceModule.__GetDependency__("downloadSource");
    const execSync = sinon.spy();

    before(() => {
        downloadSourceModule.__Rewire__("execSync", execSync);
    });
    after(() => {
        downloadSourceModule.__ResetDependency__("execSync");
    });
    beforeEach(() => {
        execSync.reset();
    });

    it("execs a command to download and unpack the source tarball from the provided url", () => {
        downloadSource("https://github.com/lk-architecture/example-lambda.git");
        expect(execSync).to.have.been.calledWith(
            "curl \"https://github.com/lk-architecture/example-lambda.git\" -L | tar xz --strip-components 1 -C .",
            {stdio: "inherit"}
        );
    });

});
