// const steam = require('./steam.js');
// const steamTagData = require('./steamspy_tag_data.js');
// const steamSupportInfo = require('./steam_support_info.js');
// const steamRequirementData = require('./steam_requirement_data.js');
// const steamMediaData = require('./steam_media_data.js');
// const steamDescriptionData = require('./steam_description_data.js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { Client } = require('@elastic/elasticsearch');


const client = new Client({ node: 'http://localhost:9200' });

const csvNames = [
    'steam',
    'steamspy_tag_data',
    'steam_support_info',
    'steam_requirements_data',
    'steam_media_data',
    'steam_description_data'
];

// Inserts data into ElasticSearch
async function insertData(dataset, parserInfo) {
    await client.indices.create(parserInfo.dbIndexScheme, { ignore: [400] })

    const body = dataset.flatMap(doc => [{ index: { _index: parserInfo.dbIndexScheme.index } }, doc])
    const { body: bulkResponse } = await client.bulk({ refresh: true, body })
    
    if (bulkResponse.errors) {
        const erroredDocuments = []
        // The items array has the same order of the dataset we just indexed.
        // The presence of the `error` key indicates that the operation
        // that we did for the document has failed.
        bulkResponse.items.forEach((action, i) => {
            const operation = Object.keys(action)[0]
            if (action[operation].error) {
                erroredDocuments.push({
                    // If the status is 429 it means that you can retry the document,
                    // otherwise it's very likely a mapping error, and you should
                    // fix the document before to try it again.
                    status: action[operation].status,
                    error: action[operation].error,
                    operation: body[i * 2],
                    document: body[i * 2 + 1]
                })
            }
        })
        console.log(erroredDocuments)
    }
    console.log(parserInfo.dbIndexScheme.index);
    const { body: count } = await client.count({ index: parserInfo.dbIndexScheme.index })
    console.log("Documents inserted: ", count)
}

csvNames.forEach((csvName) => {
    const csvPath = path.resolve('../csv/' + csvName + '.csv');
    const parserInfo = require('./' + csvName + '.js');
    const objectData = [];

    fs
        .createReadStream(csvPath)
        .pipe(csv())
        .on('data', data => {
            console.log(parserInfo);
            objectData.push(parserInfo.objectImport(data));
        })
        .on('end', async () => {
            await insertData(objectData.slice(0, objectData.length * 0.25), parserInfo).catch(console.error);
            await insertData(objectData.slice(objectData.length * 0.25, objectData.length * 0.5), parserInfo).catch(console.error);
            await insertData(objectData.slice(objectData.length * 0.5, objectData.length * 0.75), parserInfo).catch(console.error);
            await insertData(objectData.slice(objectData.length * 0.75, objectData.length), parserInfo).catch(console.error);
        });
})
