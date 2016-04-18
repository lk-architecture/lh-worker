#!/usr/bin/env node

import yargs from "yargs";
import lhWorker from "../lh-worker";

const argv = yargs
    .help("help")
    .wrap(100)
    .usage("Usage: $0 <options>")
    .env("LH_WORKER_")
    .option("awsAccessKeyId", {
        alias: "AWS_ACCESS_KEY_ID",
        demand: true,
        type: "string"
    })
    .option("awsSecretAccessKey", {
        alias: "AWS_SECRET_ACCESS_KEY",
        demand: true,
        type: "string"
    })
    .option("awsRegion", {
        alias: "AWS_REGION",
        demand: true,
        describe: "AWS region of the S3 bucket",
        type: "string"
    })
    .option("s3Bucket", {
        alias: "S3_BUCKET",
        demand: true,
        describe: "S3 bucket to upload to",
        type: "string"
    })
    .option("sourceTarballUrl", {
        alias: "SOURCE_TARBALL_URL",
        demand: true,
        describe: "Source tarball url",
        type: "string"
    })
    .option("organizationName", {
        alias: "ORGANIZATION_NAME",
        demand: true,
        describe: "Name of the lambda-hub organization",
        type: "string"
    })
    .option("lambdaName", {
        alias: "LAMBDA_NAME",
        demand: true,
        describe: "Name of the lambda",
        type: "string"
    })
    .option("buildId", {
        alias: "BUILD_ID",
        demand: true,
        describe: "Id of the build",
        type: "string"
    })
    .argv;

lhWorker(argv);
