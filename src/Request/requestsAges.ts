export const requestAges = (page: number) => {
    return {
        index: 'project_s6_required_ages',
        body: {
            "from": ((page * 10) - 10),
            "size": 10
        }  
    }
}