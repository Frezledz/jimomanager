
const { default: axios } = require("axios");
const getrank = (username)=>{
    return new Promise((resolve,reject)=>{
        axios({url: `https://api.scratch.mit.edu/projects/832169787/`,method:"get"}).then(res=>res.data).catch(res=>reject(res)).then(res=>{
            const raw = res.instructions.split("\n");
            let i=0;
            let ii=0;
            let needstr =[[ "• – • Master intro makers • – •","• – • Advanced intro makers • – •","• – • Good intro makers • – •"],[null,"Master","Advanced","Good"]];
            while(true){
                
                if(i>raw.length-1){
                    resolve("Visitor");
                    break;
                }
                const tmp =raw[i].toLowerCase();
                if(ii<3){
                    if(tmp.includes(needstr[0][ii].toLowerCase())){
                        ii++;
                    }
                }
                if(tmp.includes(username.toLowerCase())&&ii!=0){
                    resolve(needstr[1][ii]);
                    break;
                    
                }
                i++;
            }
  
        });
  
    })
  };
getrank("maizenichi0403").then(res=>{console.log(res)});