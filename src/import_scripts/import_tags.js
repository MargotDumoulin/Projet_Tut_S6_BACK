const neatCsv = require('neat-csv');
const fs = require('fs');
const path = require('path');
const levenshtein = require('js-levenshtein');

async function parse() {
    const csvPath = path.resolve('csv/steam.csv');
    const parserInfo = require('./steam.js');

    const steamspyTagsInfo = require('./steamspy_tag_data.js');
    const tagsFormat = steamspyTagsInfo.dbIndexScheme.body.mappings.properties;

    const tagsSet = new Set();
    const rawCsv = fs.readFileSync(csvPath, { encoding: 'utf8'});
    const csvData = await neatCsv(rawCsv);
    
    for (let data of csvData) {
        parserInfo.objectImport(data).steamspy_tags.forEach(tag => {
            tagsSet.add(tag);            
        });
    }

    return Array.from(tagsSet).map(tagName => {
        /* SET OF RULES: 
        1. Trim whitespaces before and after 
        2. Tags were set to lowercase
        3. "." were replaced by "$"
        4. "&" were replaced by "and"
        4. "-" were replaced "_"
        5. Spaces " " were replaced by "_"
        6. "'" were removed 
        7. Added prefix 'tag_' before each tag */

        const transformTag = 'tag_' + tagName.trim()
                                        .toLowerCase()
                                        .replace(/\./g, '$')
                                        .replace(/&/g, 'and')
                                        .replace(/-/g, '_')
                                        .replace(/ /g, '_')
                                        .replace(/'/g, "");

        // We allow a Levenshtein distance of maximum 15 % of the tag length (-4 is because there's always tag_)
        const maxLevenshteinDistance = Math.round((transformTag.length - 4) * 0.15);
        // Check if tag exists with Levenshtein algorithm
        const rightTag = Object.keys(tagsFormat).find(tag => levenshtein(tag, transformTag) <= maxLevenshteinDistance);

        return { name: tagName, value: rightTag };
    });
}

const dbIndexScheme = {
    index: 'project_s6_tags',
    body: {
        settings: {
            analysis: {
                normalizer: {
                    my_normalizer: {
                        type: "custom",
                        char_filter: [],
                        filter: "lowercase"
                    }
                }
            }
        },
        mappings: {
            properties: {
                name: { type: 'keyword', normalizer: "my_normalizer" },
                value: { type: 'keyword' }
            }
        }
    } 
}

module.exports = { parse, dbIndexScheme };