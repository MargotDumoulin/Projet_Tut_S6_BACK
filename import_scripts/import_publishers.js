const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const parse = new Promise((resolve) => {
    const csvPath = path.resolve('../csv/steam.csv');
    const parserInfo = require('./steam.js');
    
    const publishersSet = new Set();
    fs
        .createReadStream(csvPath)
        .pipe(csv())
        .on('data', data => {
            parserInfo.objectImport(data).publisher.forEach(publisher => {
                publishersSet.add(publisher);
            });
        })
        .on('end', () => {
            resolve(Array.from(publishersSet).map(publisherName => ({ name: publisherName })));
        });
});

const dbIndexScheme = {
    index: 'project_s6_publishers',
    body: {
        mappings: {
            properties: {
                name: { type: 'text' }
            }
        }
    } 
}

module.exports = { parse, dbIndexScheme };