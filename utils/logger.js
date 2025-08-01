import winston from "winston";
const { combine, timestamp, printf, colorize, align, errors, json } = winston.format;


export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}` )
  ),
  transports: [
    new winston.transports.Console({
      level: "http",
    }),
  ],
});