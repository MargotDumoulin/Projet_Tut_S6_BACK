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

export const requestUsers = (page: number) => {
    return {
        index: 'project_s6_users',
        body: {
            "from": ((page * 10) - 10),
            "size": 10
        }  
    }
}

export const requestLibrary = (page: number, email: string) => {
    return {
        index: 'project_s6_users',
        body: {
            "from": ((page * 10) - 10),
            "size": 10,
            "_source": ["library"],
            query: {
                bool: {
                    filter: [
                        {
                            term: {
                                email: email
                            }
                        }
                    ]
                } 
            }
        }  
    }
}