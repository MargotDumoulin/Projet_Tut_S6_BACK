export const requestDevelopersByName = (page: number, nameGiven: string) => {
    return {
        index: 'project_s6_developers',
        body: {
            "from": ((page * 10) - 10),
            "size": 10,
            query: {
                bool: {
                    should: [
                        {
                            prefix: {
                                name: nameGiven
                            }
                        },
                        {
                            match: {
                                name: {
                                    query: nameGiven,
                                    fuzziness: "AUTO",
                                    prefix_length: 0 
                                }
                            }
                        }
                    ]
                }
            }
        }  
    }
}

export const requestDevelopers = (page: number) => {
    return {
        index: 'project_s6_developers',
        body: {
            "from": ((page * 10) - 10),
            "size": 10
        }  
    }
}