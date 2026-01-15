import auditService from '../services/audit.services.js';

export const getAllAudits = async (req, res) => {
 try {
  const audits = await auditService.getAllAudits();
  res.status(200).json(audits);
 } catch (error) {
  res.status(500).json({ message: 'Internal server error' });
 }
};

export const getAuditById = async (req, res) => {
 const auditId = req.params.auditId;
 try {
  const audit = await auditService.getAuditById(auditId);
  if (!audit) {
   return res.status(404).json({ message: 'Audit not found' });
  }
  res.status(200).json(audit);
 } catch (error) {
  res.status(500).json({ message: 'Internal server error' });
 }
};

export const auditIssues = async (req, res) => {
 try {
  const auditResult = await auditService.auditIssues();
  res.status(200).json(auditResult);
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
 }
};

export const auditWeather = async (req, res) => {
 try {
  const { city, latitude, longitude, threshold, operator = '>', weeks = 4 } = req.body;
  if (!city || latitude === undefined || longitude === undefined || threshold === undefined) {
   return res.status(400).json({ message: 'Missing required fields: city, latitude, longitude, threshold' });
  }

  const auditResult = await auditService.auditWeather(city, latitude, longitude, threshold, operator, weeks);
  res.status(200).json(auditResult);
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
 }
};