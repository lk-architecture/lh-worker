import {execSync} from "child_process";
import step from "../utils/step";

function downloadSource (sourceTarballUrl) {
    execSync(
        `curl "${sourceTarballUrl}" -L | tar xz --strip-components 1 -C .`,
        {stdio: "inherit"}
    );
}

export default step("Source download", downloadSource);
