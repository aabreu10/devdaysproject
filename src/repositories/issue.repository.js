import Issue from '../models/issue.model.js';

const findAll = async (page, limit) => {
    if (page && limit) {
        const skip = (page - 1) * limit;
        return await Issue.find().skip(skip).limit(limit);
    }
    return await Issue.find();
};

const findByIssueId = async (issueId) => {
    return await Issue.findOne({ issueId });
};

const create = async (issueData) => {
    const issue = new Issue(issueData);
    return await issue.save();
};

export default {
    findAll,
    create,
    findByIssueId,
};