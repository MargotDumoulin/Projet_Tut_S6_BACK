const dbIndexScheme = {
    index: 'project_s6_steam_support_info',
    body: {
        mappings: {
            properties: {
                id: { type: 'integer' },
                website: { type: 'text' },
                support_url: { type: 'text' },
                support_email: { type: 'text' }
            }
        }
    }
};

const objectImport = (data) => ({
    id: data.steam_appid,
    website: data.website,
    support_url: data.support_url,
    support_email: data.support_email
});

module.exports = { objectImport, dbIndexScheme };