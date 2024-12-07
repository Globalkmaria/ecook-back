import { Request, Response, NextFunction } from "express";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getRandomId } from "../utils/numbers.js";
import { s3Client } from "../db/aws.js";
import { config } from "../config/index.js";

export const logRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.NODE_ENV === "dev") return next();

  const startTime = Date.now();
  const originalSend = res.send;

  // Intercept res.send to capture the response body
  res.send = function (body) {
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      response: {
        statusCode: res.statusCode,
        body: body,
      },
      duration: `${Date.now() - startTime}ms`,
    };

    saveLogToS3(logData).catch(console.error);

    return originalSend.call(this, body);
  };

  next();
};

const saveLogToS3 = async (logData: Record<string, any>): Promise<void> => {
  const logString = JSON.stringify(logData, null, 2);
  const logFileName = `logs/${Date.now()}-${getRandomId()}.json`;

  const params = {
    Bucket: config.s3.bucket,
    Key: logFileName,
    Body: logString,
    ContentType: "application/json",
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
  } catch (error) {
    console.error("Error saving log to S3:", error);
  }
};

export const errorLogger = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body,
    error: {
      message: err.message,
      stack: err.stack,
    },
  };

  try {
    await saveLogToS3(logData);
  } catch (error) {
    console.error("Error saving error log to S3:", error);
  }
  next(err);
};
