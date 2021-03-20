const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const parse = new Promise((resolve) => {
    const csvPath = path.resolve('../csv/steam.csv');
    const parserInfo = require('./steam.js');
    
    const developersSet = new Set();
    fs
        .createReadStream(csvPath)
        .pipe(csv())
        .on('data', data => {
            parserInfo.objectImport(data).developer.forEach(developer => {
                developersSet.add(developer);
            });
        })
        .on('end', () => {
            resolve(Array.from(developersSet).map(developerName => ({ name: developerName })));
        });
});

const dbIndexScheme = {
    index: 'project_s6_developers',
    body: {
        mappings: {
            properties: {
                name: { type: 'text' }
            }
        }
    } 
}

module.exports = { parse, dbIndexScheme };