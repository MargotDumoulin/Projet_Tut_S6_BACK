const dbIndexScheme = {
    index: 'project_s6_users',
    body: {
        mappings: {
            properties: {
                id: { type: 'integer' },
                lastname: { type: 'text' },
                firstname: { type: 'text' },
                email: { type: 'text' },
                password: { type: 'text' },

            }
        }
    }
};

const objectImport = (data) => ({
    id: data.userid,
    lastname: data.lastname,
    firstname: data.firstname,
    email: data.email,
    password: data.password

});

module.exports = { objectImport, dbIndexScheme };