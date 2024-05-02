const { default: axios } = require("axios");
const fs = require("fs");
const generate_json = async (username)=>{
    let ids = [];
    let scdata = JSON.parse(fs.readFileSync("scratch.json"));
    let offset=0;
    while(true){
        const res = (await axios.get(`https://api.scratch.mit.edu/users/${username}/projects/?limit=40&offset=${offset}&timestamp=${new Date().getTime()}`)).data;
        console.log(res.length);
        if(res.length===0){
            break;
        }
        res.forEach(element => {
            ids.push(element.id);
        });
        offset+=40;
    }
    scdata[username]={"raw":ids};
  fs.writeFile("scratch.json",JSON.stringify(scdata),(err)=>{});

}
