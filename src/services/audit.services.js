import auditRepository from '../repositories/audit.repository.js';
import IssueRepository from '../repositories/issue.repository.js';
import weatherService from './weather.service.js';

export const getAllAudits = async () => {
 return await auditRepository.findAll();
};

export const getAuditById = async (id) => {
 return await auditRepository.findByAuditId(id);
};

export const auditWeather = async (city, latitude, longitude, threshold, operator, weeks) => {
 const auditAnalysis = await weatherService.analyzeWeatherAudit(
  city, latitude, longitude, threshold, operator, weeks
 );

 const auditRecord = {
  auditId: `audit-weather-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  createdAt: new Date(),
  compliant: auditAnalysis.summary.isAuditPassed,
  metadata: {
   city: auditAnalysis.city,
   coordinates: { lat: auditAnalysis.latitude, lon: auditAnalysis.longitude },
   threshold: auditAnalysis.threshold,
   summary: auditAnalysis.summary,
   auditPeriod: auditAnalysis.auditPeriod
  },
  evidences: auditAnalysis.results
 };

 return await auditRepository.create(auditRecord);
};

export const auditIssues = async () => {
 const issues = await IssueRepository.findAll();    
 const issuesWithBugInTitle = issues.filter(issue => /bug/i.test(issue.title));
 const totalIssues = issues.length;
 const ratioWithBugInTitle = totalIssues === 0 ? 0 : issuesWithBugInTitle.length / totalIssues;

 const evidences = issuesWithBugInTitle.map(issue => 
    typeof issue.toObject === 'function' ? issue.toObject() : issue
 );

 const auditRecord = {
  auditId: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  createdAt: new Date(),
  compliant: ratioWithBugInTitle <= 0.50,
  metadata: {
   totalIssues: totalIssues,
   issuesWithBugInTitle: issuesWithBugInTitle.length,
   ratioWithBugInTitle: ratioWithBugInTitle,
   operation: 'ratioWithBugInTitle <= 0.50'
  },
  evidences: evidences
 };

 const auditCreated = await auditRepository.create(auditRecord);
 return auditCreated;
};

export default {
 getAllAudits,
 getAuditById,
 auditIssues,
 auditWeather
};