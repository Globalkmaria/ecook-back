"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_s3_1 = require("@aws-sdk/client-s3");
const aws_js_1 = require("../../db/aws.js");
const s3Utils_js_1 = require("../../utils/s3Utils.js");
const router = express_1.default.Router();
router.get("/:folder/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, folder } = req.params;
        if (!id)
            return res.status(400).send();
        const command = new client_s3_1.GetObjectCommand((0, s3Utils_js_1.getS3Pragmas)(`${folder}/${id}`));
        const data = yield aws_js_1.s3Client.send(command);
        let contentType = "image/jpeg";
        if (id.endsWith(".webp"))
            contentType = "image/webp";
        res.writeHead(200, {
            "Content-Type": contentType,
            "cache-control": "max-age=604800, public",
        });
        data.Body.pipe(res);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
