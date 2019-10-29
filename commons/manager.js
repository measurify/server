
const mongoose = require('mongoose');
const Tag = mongoose.model('Tag');

exports.getResourceList = async function(query, sort, select, resource) {
    if (!query.page) query.page = '1';
    if (!query.limit) query.limit = '10';
    if (!query.filter) query.filter = '{}';
    if (!query.sort) query.sort = sort;
    if (!query.select) query.select = select;
    if (query.filter.startsWith("[")) { query.filter = "{ \"$or\": " + query.filter + " }" };
    const filter = JSON.parse(query.filter);
    const options = {
        select: JSON.parse(query.select),
        sort: JSON.parse(query.sort),
        page: parseInt(query.page),
        limit: parseInt(query.limit)
    }
    return await resource.paginate(filter, options);
}

exports.modifyTagList = async function(resource, tags) {
    if(tags.remove) {
        for (let value of tags.remove) { if (!await Tag.findById(value)) throw new Error('Tag to be removed not found: ' + value); };
        resource.tags = resource.tags.filter(value => !tags.remove.includes(value));
    }
    if(tags.add) {
        for (let value of tags.add) { if (!await Tag.findById(value))  throw new Error('Tag to be added not found: ' + value); };
        resource.tags.push(...tags.add);
    }
    resource.tags = [...new Set(resource.tags)];
    return true;
}