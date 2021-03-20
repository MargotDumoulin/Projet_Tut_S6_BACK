const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const parse = new Promise((resolve) => {
    const csvPath = path.resolve('../csv/steam.csv');
    const parserInfo = require('./steam.js');
    
    const categoriesSet = new Set();
    fs
        .createReadStream(csvPath)
        .pipe(csv())
        .on('data', data => {
            parserInfo.objectImport(data).categories.forEach(categorie => {
                categoriesSet.add(categorie);
            });
        })
        .on('end', () => {
            resolve(Array.from(categoriesSet).map(categorieName => ({ name: categorieName })));
        });
});

const dbIndexScheme = {
    index: 'project_s6_categories',
    body: {
        mappings: {
            properties: {
                name: { type: 'text' }
            }
        }
    } 
}

module.exports = { parse, dbIndexScheme };