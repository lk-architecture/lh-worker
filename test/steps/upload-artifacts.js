import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import uploadArtifactsModule from "steps/upload-artifacts";

chai.use(sinonChai);

describe("lambdafileExecutionSuccessful", () => {

    const lambdafileExecutionSuccessful = uploadArtifactsModule.__GetDependency__(
        "lambdafileExecutionSuccessful"
    );

    after(() => {
        uploadArtifactsModule.__ResetDependency__("readFileSync");
    });

    it("when Lambdafile-exec-result.json has status === 0, returns true", () => {
        const readFileSync = sinon.stub().returns(JSON.stringify({
            status: 0
        }));
        uploadArtifactsModule.__Rewire__("readFileSync", readFileSync);
        const ret = lambdafileExecutionSuccessful();
        expect(ret).to.equal(true);
    });

    it("when Lambdafile-exec-result.json has status !== 0, returns false", () => {
        const readFileSync = sinon.stub().returns(JSON.stringify({
            status: 1
        }));
        uploadArtifactsModule.__Rewire__("readFileSync", readFileSync);
        const ret = lambdafileExecutionSuccessful();
        expect(ret).to.equal(false);
    });

});

describe("uploadArtifacts", () => {

    const uploadArtifacts = uploadArtifactsModule.__GetDependency__(
        "uploadArtifacts"
    );

    after(() => {
        uploadArtifactsModule.__ResetDependency__("execSync");
        uploadArtifactsModule.__ResetDependency__("lambdafileExecutionSuccessful");
    });

    it("uploads Lambdafile-exec-result.json to S3 (via awscli) [CASE: lambdafileExecutionSuccessful() === true]", () => {
        const execSync = sinon.spy();
        const lambdafileExecutionSuccessful = sinon.stub().returns(true);
        uploadArtifactsModule.__Rewire__("execSync", execSync);
        uploadArtifactsModule.__Rewire__("lambdafileExecutionSuccessful", lambdafileExecutionSuccessful);
        uploadArtifacts({
            awsAccessKeyId: "awsAccessKeyId",
            awsSecretAccessKey: "awsSecretAccessKey",
            awsRegion: "awsRegion",
            s3Bucket: "s3Bucket",
            organizationName: "organizationName",
            lambdaName: "lambdaName",
            buildId: "buildId"
        });
        expect(execSync).to.have.been.calledWith(
            "aws s3 cp Lambdafile-exec-result.json s3://s3Bucket/organizationName/lambdaName/buildId/Lambdafile-exec-result.json",
            {
                env: {
                    AWS_ACCESS_KEY_ID: "awsAccessKeyId",
                    AWS_SECRET_ACCESS_KEY: "awsSecretAccessKey",
                    AWS_DEFAULT_REGION: "awsRegion"
                },
                stdio: "inherit"
            }
        );
    });

    it("uploads Lambdafile-exec-result.json to S3 (via awscli) [CASE: lambdafileExecutionSuccessful() === false]", () => {
        const execSync = sinon.spy();
        const lambdafileExecutionSuccessful = sinon.stub().returns(false);
        uploadArtifactsModule.__Rewire__("execSync", execSync);
        uploadArtifactsModule.__Rewire__("lambdafileExecutionSuccessful", lambdafileExecutionSuccessful);
        uploadArtifacts({
            awsAccessKeyId: "awsAccessKeyId",
            awsSecretAccessKey: "awsSecretAccessKey",
            awsRegion: "awsRegion",
            s3Bucket: "s3Bucket",
            organizationName: "organizationName",
            lambdaName: "lambdaName",
            buildId: "buildId"
        });
        expect(execSync).to.have.been.calledWith(
            "aws s3 cp Lambdafile-exec-result.json s3://s3Bucket/organizationName/lambdaName/buildId/Lambdafile-exec-result.json",
            {
                env: {
                    AWS_ACCESS_KEY_ID: "awsAccessKeyId",
                    AWS_SECRET_ACCESS_KEY: "awsSecretAccessKey",
                    AWS_DEFAULT_REGION: "awsRegion"
                },
                stdio: "inherit"
            }
        );
    });

    it("uploads bundle.zip to S3 (via awscli) when lambdafileExecutionSuccessful() === true", () => {
        const execSync = sinon.spy();
        const lambdafileExecutionSuccessful = sinon.stub().returns(true);
        uploadArtifactsModule.__Rewire__("execSync", execSync);
        uploadArtifactsModule.__Rewire__("lambdafileExecutionSuccessful", lambdafileExecutionSuccessful);
        uploadArtifacts({
            awsAccessKeyId: "awsAccessKeyId",
            awsSecretAccessKey: "awsSecretAccessKey",
            awsRegion: "awsRegion",
            s3Bucket: "s3Bucket",
            organizationName: "organizationName",
            lambdaName: "lambdaName",
            buildId: "buildId"
        });
        expect(execSync).to.have.been.calledWith(
            "aws s3 cp bundle.zip s3://s3Bucket/organizationName/lambdaName/buildId/bundle.zip",
            {
                env: {
                    AWS_ACCESS_KEY_ID: "awsAccessKeyId",
                    AWS_SECRET_ACCESS_KEY: "awsSecretAccessKey",
                    AWS_DEFAULT_REGION: "awsRegion"
                },
                stdio: "inherit"
            }
        );
    });

    it("doesn't upload bundle.zip to S3 (via awscli) when lambdafileExecutionSuccessful() === false", () => {
        const execSync = sinon.spy();
        const lambdafileExecutionSuccessful = sinon.stub().returns(false);
        uploadArtifactsModule.__Rewire__("execSync", execSync);
        uploadArtifactsModule.__Rewire__("lambdafileExecutionSuccessful", lambdafileExecutionSuccessful);
        uploadArtifacts({
            awsAccessKeyId: "awsAccessKeyId",
            awsSecretAccessKey: "awsSecretAccessKey",
            awsRegion: "awsRegion",
            s3Bucket: "s3Bucket",
            organizationName: "organizationName",
            lambdaName: "lambdaName",
            buildId: "buildId"
        });
        expect(execSync).not.to.have.been.calledWith(
            "aws s3 cp bundle.zip s3://s3Bucket/organizationName/lambdaName/buildId/bundle.zip",
            {
                env: {
                    AWS_ACCESS_KEY_ID: "awsAccessKeyId",
                    AWS_SECRET_ACCESS_KEY: "awsSecretAccessKey",
                    AWS_DEFAULT_REGION: "awsRegion"
                },
                stdio: "inherit"
            }
        );
    });

});
