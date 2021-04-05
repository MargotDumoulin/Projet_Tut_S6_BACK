const dbIndexScheme = {
    index: 'project_s6_steam_requirements_data',
    body: {
        mappings: {
            properties: {
                id: { type: 'integer' },
                pc_requirements: { type: 'object' },
                mac_requirements: { type: 'object' },
                linux_requirements: { type: 'object' },
                minimum: { type: 'text' },
                recommended: { type: 'text' }
            }
        }
    }
};

const objectImport = (data) => ({
    id: data.steam_appid,
    pc_requirements: data.pc_requirements !== '[]' ? formatStr(data.pc_requirements) : [{}],
    mac_requirements: data.mac_requirements !== '[]' ? formatStr(data.mac_requirements) : [{}], //JSON.parse(data.mac_requirements.replace(/\"/g, '\\"').replace(/'/g, '"')),
    linux_requirements: data.linux_requirements !== '[]' ? formatStr(data.linux_requirements) : [{}], //JSON.parse(data.linux_requirements.replace(/\"/g, '\\"').replace(/'/g, '"')),
    minimum: data.minimum,
    recommended: data.recommended
});

// formats a {'minimum': '..', 'recommended': '..' } into something parseable
const formatStr = (str) => {

    let firstSplit = str.split("'minimum': ")[1];

    if (firstSplit) {
        let [minimumRequirements, recommendedRequirements] = firstSplit.split(", 'recommended': ");
    
        // Get rid of first char and last char
        minimumRequirements = minimumRequirements.substring(1, minimumRequirements.length - 2);

        if (recommendedRequirements?.length > 0) {
            recommendedRequirements = recommendedRequirements.substring(1, recommendedRequirements.length - 2);
            
            return { 
                minimum: minimumRequirements.replace(/\\'/g, "'"),
                recommended: recommendedRequirements.replace(/\\'/g, "'")
            };
        } else {
            return { 
                minimum: minimumRequirements.replace(/\\'/g, "'")
            };
        }
    } else {
        firstSplit = str.split("'recommended': ");
        let recommendedRequirements = firstSplit[1];
        recommendedRequirements = recommendedRequirements.substring(1, recommendedRequirements.length - 2);

        return { 
            recommended: recommendedRequirements.replace(/\\'/g, "'")
        };
    }
        
};

module.exports = { objectImport, dbIndexScheme };

