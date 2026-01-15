import { Router } from "express";
import { getAllAudits, getAuditById, auditIssues, auditWeather } from "../controllers/audit.controller.js";

const auditRouter = Router();

auditRouter.get('/audits', getAllAudits);
auditRouter.get('/audits/:auditId', getAuditById);
auditRouter.post('/audits/issues', auditIssues);
auditRouter.post('/audits/weather', auditWeather);

export { auditRouter };