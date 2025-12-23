type Access = { 
    resourceType : string;
    resourcePath : string;
}



function AccessProvider(path: string) 
{
  const str = sessionStorage.getItem('access');
    JSON.parse(str || '[]') as Access[];
    if (str) {
        {
            const accessList = JSON.parse(str) as Access[];     
            for (const access of accessList) {
                if (access.resourcePath === path) {
                    return true;
                }
            }           
        }
    }
    return false;   
}

export default AccessProvider;