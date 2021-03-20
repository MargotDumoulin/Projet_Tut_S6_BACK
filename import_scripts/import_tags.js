const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const parse = new Promise((resolve) => {
    const csvPath = path.resolve('../csv/steam.csv');
    const parserInfo = require('./steam.js');
    
    const tagsSet = new Set();
    fs
    .createReadStream(csvPath)
    .pipe(csv())
    .on('data', data => {
        parserInfo.objectImport(data).steamspy_tags.forEach(tag => {
            tagsSet.add(tag);
        });
    })
    .on('end', () => {
        resolve(Array.from(tagsSet).map(tagName => ({ name: tagName })));
    });
});

const dbIndexScheme = {
    index: 'project_s6_tags',
    body: {
        mappings: {
            properties: {
                name: { type: 'text' }
            }
        }
    } 
}

module.exports = { parse, dbIndexScheme };