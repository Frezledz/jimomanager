const { default: axios } = require("axios");

const generate_json = (username)=>{
    axios.get(`https://api.scratch.mit.edu/users/${username}/projects`).then(res=>res.data).then(a=>{
        let ids="";
        a.forEach(element => {
            ids=`${ids}${element.id},`;
        });
        ids = ids.slice(0, -1);
        console.log(`"${username}":{"raw":[${ids}]}`);
    
    })

}

generate_json("xX_Freezer_Xx");
generate_json("Ashibara_Art");
generate_json("omowaka");
generate_json("Crystal-25");
generate_json("kirbyzaz");