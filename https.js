const http = require("http");
const request = (link)=>{
    return new Promise((resolve,reject)=>{
        http.get(`http://explodingstar.pythonanywhere.com/scratch/api/?endpoint=${link}`,res=>{
            let chunks = [];
            res.on("data",a=>{
                chunks.push(a);
            })
            res.on("end",()=>{
                console.log(res.statusCode);
                if(res.statusCode==200){
                    const re = Buffer.concat(chunks);
                    const reg = JSON.parse(Buffer.from(re,"utf-8").toString());
                    if("code" in reg){
                        reject(404);
                    } else{
                        resolve(reg);
                    }
                } else{
                    reject(res.statusCode);
                }
            })
        })
    })
}
module.exports={request};