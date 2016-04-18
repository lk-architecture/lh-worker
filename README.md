[![Dependency Status](https://david-dm.org/lambda-hub/lh-worker.svg)](https://david-dm.org/lambda-hub/lh-worker)
[![devDependency Status](https://david-dm.org/lambda-hub/lh-worker/dev-status.svg)](https://david-dm.org/lambda-hub/lh-worker#info=devDependencies)

# lh-worker

Lambda Hub worker.

## Usage

```sh
docker run lambdahub/lh-worker\
-e "LH_WORKER_AWS_ACCESS_KEY_ID=AWS_ACCESS_KEY_ID"\
-e "LH_WORKER_AWS_SECRET_ACCESS_KEY=AWS_SECRET_ACCESS_KEY"\
-e "LH_WORKER_AWS_REGION=AWS_REGION"\
-e "LH_WORKER_S3_BUCKET=S3_BUCKET"\
-e "LH_WORKER_SOURCE_TARBALL_URL=SOURCE_TARBALL_URL"\
-e "LH_WORKER_ORGANIZATION_NAME=ORGANIZATION_NAME"\
-e "LH_WORKER_LAMBDA_NAME=LAMBDA_NAME"\
-e "LH_WORKER_BUILD_ID=BUILD_ID"
```
