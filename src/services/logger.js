import bunyan from "bunyan";
import {LOG_LEVEL, NODE_ENV} from "../config";

const log = bunyan.createLogger({
    name: "worker",
    streams: [
        NODE_ENV !== "test" ? {
            stream: process.stdout
        } : null
    ].filter(e => e)
});
log.level(LOG_LEVEL);
export default log;
