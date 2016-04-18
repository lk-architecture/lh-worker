import {execSync} from "child_process";
import {readFileSync} from "fs";
import {BUNDLE_FILENAME, LAMBDAFILE_EXEC_LOG_FILENAME} from "../config";
import step from "../utils/step";

function lambdafileExecutionSuccessful () {
    const result = JSON.parse(
        readFileSync(LAMBDAFILE_EXEC_LOG_FILENAME, "utf8")
    );
    return (result.status === 0);
}

function uploadArtifacts (options) {
    const {
        awsAccessKeyId,
        awsSecretAccessKey,
        awsRegion,
        s3Bucket,
        organizationName,
        lambdaName,
        buildId
    } = options;
    const awsCliEnv = {
        AWS_ACCESS_KEY_ID: awsAccessKeyId,
        AWS_SECRET_ACCESS_KEY: awsSecretAccessKey,
        AWS_DEFAULT_REGION: awsRegion
    };
    const baseS3Path = `s3://${s3Bucket}/${organizationName}/${lambdaName}/${buildId}`;
    execSync(
        `aws s3 cp ${LAMBDAFILE_EXEC_LOG_FILENAME} ${baseS3Path}/${LAMBDAFILE_EXEC_LOG_FILENAME}`,
        {env: awsCliEnv, stdio: "inherit"}
    );
    if (lambdafileExecutionSuccessful()) {
        // Only upload the bundle if the Lambdafile executed successfully
        execSync(
            `aws s3 cp ${BUNDLE_FILENAME} ${baseS3Path}/${BUNDLE_FILENAME}`,
            {env: awsCliEnv, stdio: "inherit"}
        );
    }
}

export default step("Artifacts upload", uploadArtifacts);
