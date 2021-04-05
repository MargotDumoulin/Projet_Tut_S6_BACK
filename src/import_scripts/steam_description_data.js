const dbIndexScheme = {
    index: 'project_s6_steam_description_data',
    body: {
        mappings: {
            properties: {
                id: { type: 'integer' },
                detailed_description: { type: 'text' },
                about_the_game: { type: 'text' },
                short_description: { type: 'text' }
            }
        }
    }
};

const objectImport = (data) => ({
    id: data.steam_appid,
    detailed_description: data.detailed_description,
    about_the_game: data.about_the_game,
    short_description: data.short_description
});

module.exports = { objectImport, dbIndexScheme };