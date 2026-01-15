import axios from 'axios';
import IssueRepository from '../repositories/issue.repository.js';

export const getAllIssues = async (page, limit) => {
    return await IssueRepository.findAll(page, limit);
};

export const getIssueByIssueId = async (issueId) => {
    return await IssueRepository.findByIssueId(issueId);
};
//N1-1
const fetchGithubPaginatedData = async (url, params = {}, page = 1, allData = []) => {
    try {
        const response = await axios.get(url, {
            params: { ...params, page, per_page: 100 },
            headers: {
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'DevDays-App',
                ...(process.env.GITHUB_TOKEN && { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` })
            }
        });

        const data = [...allData, ...response.data];

        if (response.data.length === 100) {
            return fetchGithubPaginatedData(url, params, page + 1, data);
        }

        return data;
    } catch (error) {
        console.error(`Error fetching data from specific page ${page}:`, error.message);
        if (allData.length > 0) {
            console.warn(`Returning ${allData.length} items fetched before error`);
            return allData;
        }
        throw error;
    }
};

export const fetchGithubIssues = async (repoOwner, repoName) => {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;
    return await fetchGithubPaginatedData(url, { state: 'all' });
};

export const fetchGithubCommits = async (repoOwner, repoName) => {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/commits`;
    return await fetchGithubPaginatedData(url);
};

export const fetchGithubPullRequests = async (repoOwner, repoName) => {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/pulls`;
    return await fetchGithubPaginatedData(url, { state: 'all' });
};

export const saveIssues = async (issues) => {
    const savedIssues = [];
    for (const issueData of issues) {
        const existingIssue = await IssueRepository.findByIssueId(issueData.id);
        if (!existingIssue) {
            // DONE: Store the updated_at field from the GitHub issue
            const newIssue = {
                issueId: issueData.id,
                number: issueData.number,
                title: issueData.title,
                body: issueData.body,
                url: issueData.html_url,
                state: issueData.state,
                createdAt: issueData.created_at,
                updatedAt: issueData.updated_at,
            };
            savedIssues.push(await IssueRepository.create(newIssue));
        } else {
            savedIssues.push(existingIssue);
        }
    };
    return savedIssues;
};

export default {
    getAllIssues,
    getIssueByIssueId,
    fetchGithubIssues,
    saveIssues
};