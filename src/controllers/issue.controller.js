import issueService from '../services/issue.service.js';
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('issue-controller-meter');

let lastSyncTimestamp = Date.now();

const dataFreshnessGauge = meter.createObservableGauge('github_issue_freshness_seconds', {
    description: 'Time in seconds since the last successful GitHub issues sync',
    unit: 's',
});

dataFreshnessGauge.addCallback((observableResult) => {
    observableResult.observe((Date.now() - lastSyncTimestamp) / 1000);
});

export const getAllIssues = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const issues = await issueService.getAllIssues(page, limit);
        res.status(200).json(issues);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getIssueByIssueId = async (req, res) => {
    const issueId = req.params.issueId;
    try {
        const issue = await issueService.getIssueByIssueId(issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.status(200).json(issue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const fetchGithubIssues = async (req, res) => {
    const repoOwner = req.body.repository.owner;
    const repoName = req.body.repository.name;
    try {
        const githubIssues = await issueService.fetchGithubIssues(repoOwner, repoName);
        const savedIssues = await issueService.saveIssues(githubIssues);
        
        lastSyncTimestamp = Date.now();

        res.status(200).json(savedIssues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};