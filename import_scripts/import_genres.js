const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const parse = new Promise((resolve) => {
    const csvPath = path.resolve('../csv/steam.csv');
    const parserInfo = require('./steam.js');
    
    const genresSet = new Set();
    fs
        .createReadStream(csvPath)
        .pipe(csv())
        .on('data', data => {
            parserInfo.objectImport(data).genres.forEach(genre => {
                genresSet.add(genre);
            });
        })
        .on('end', () => {
            resolve(Array.from(genresSet).map(genreName => ({ name: genreName })));
        });
});

const dbIndexScheme = {
    index: 'project_s6_genres',
    body: {
        mappings: {
            properties: {
                name: { type: 'text' }
            }
        }
    } 
}

module.exports = { parse, dbIndexScheme };