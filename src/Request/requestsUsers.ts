export const requestUser = (email: string) => {
    return {
        index: [
            'project_s6_users',
        ],
        body: {
            query: {
                constant_score: {
                    filter: {
                        term: {
                            email: {
                                value: email
                            }
                        }
                    }
                }
            }    
        }  
    }
};

export const requestIsLoginInfoCorrect = (email: string, password: string) => {
    return {
        index: [
            'project_s6_users',
        ],
        body: {
            from: 0,
            size: 1,
            query: {
                bool: {
                    must: [
                        {
                            match: { 'email': email }
                        },
                        {
                            match: { 'password': password }
                        }
                    ]
                }
            }
        }
    }
}

export const requestUsers = (page: number) => {
    return {
        index: 'project_s6_users',
        body: {
            "from": ((page * 10) - 10),
            "size": 10
        }  
    }
}
