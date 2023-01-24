const { default: axios } = require("axios");
const a = async()=>{
    axios({
        url: `https://jimoapi.glitch.me/api/user/xX_Freezer_Xx`,
        method: "get"
    }).then(res=>{console.log(res.data)});

}
a();