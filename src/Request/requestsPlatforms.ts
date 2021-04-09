export const requestPlatforms = (page: number) => {
    return {
        index: 'project_s6_platforms',
        body: {
            "from": ((page * 10) - 10),
            "size": 10
        }  
    }
}