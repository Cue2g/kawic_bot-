const fetch = require('node-fetch')
const dataFun = {}


dataFun.splitF = function (ctxText, command) {
  responseText = ctxText;
  textSplit = responseText.split(command + " ")
  textArray = textSplit[1]

  if(textArray === undefined){
    return;
  }
  resultArray = textArray.split(',')
  return resultArray
}


dataFun.dataSend = async function (body) {
  const response = await fetch('https://scc.ciwok.com/wp-json/jet-cct/comisiones_dec', {
  	method: 'post',
  	body: JSON.stringify(body),
  	headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.CLIENT_TOKEN}
  })
  const data = await response.json();
  return data
}


module.exports = dataFun;
