
function getMessages(){
  let promise = axios.get('http://mock-api.driven.com.br/api/v4/uol/messages');
  promise.then(processarResposta);
}


function processarResposta(resposta) {
	console.log(resposta.data);
}

getMessages();