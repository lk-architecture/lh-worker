import log from "./services/logger";
import downloadSource from "./steps/download-source";
import execLambdafile from "./steps/exec-lambdafile";
import uploadArtifacts from "./steps/upload-artifacts";

export default function lhWorker (options) {
    log.info("lhWorker staretd", {options});
    downloadSource(options.sourceTarballUrl);
    execLambdafile();
    uploadArtifacts(options);
    log.info("lhWorker succeeded");
}
