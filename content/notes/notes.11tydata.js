
  
  export const eleventyComputed = {
  // modDate is data.date `git Last Modfied` or `file Last Modified`
  modDate: data => {
    data.date = "git Last Modified";
    return data.date;
  }
};