function isLoggedIn() {
  const username = sessionStorage.getItem('username');
  return username !== null;
}

const hasAccess = (path:string)=>{
  const str = sessionStorage.getItem('access');
    if (str) {
        {
            const accessList = JSON.parse(str);     
            for (const access of accessList) {
                if (access.resourcePath === path) {
                    return true;
                }
            }           
        }
    }
    return false;  
}   
 const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

export default isLoggedIn;
export { hasAccess };
export { readFileAsText };