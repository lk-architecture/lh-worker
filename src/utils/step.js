import log from "../services/logger";

export default function step (stepName, stepFunction) {
    return (...args) => {
        try {
            log.info(`${stepName} started`, {args});
            stepFunction(...args);
            log.info(`${stepName} succeeded`);
        } catch (err) {
            log.fatal(err, `${stepName} failed`);
            process.exit(1);
        }
    };
}
