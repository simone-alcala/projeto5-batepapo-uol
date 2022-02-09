let userName = null;

const typeStatus         = "status";
const typeMessage        = "message";
const typePrivateMessage = "private_message";
const main               = document.querySelector(".main");
const arrayMessages      = [];

function login(semErro){
  if (semErro === true){
    userName = prompt("Digite seu nome:");
  } else {
    userName = prompt("Usuário já está sala. Digite outro nome:");
  }
  validateUser();
}

function validateUser(){
  let promise = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants",{name: userName});
  
  promise.catch(login);//VERIFICAR 
  
  console.log(promise.catch().data);
  
  promise.then(getMessages);
  setInterval(keepConnected,5000);
}

function getMessages(){
  let promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");
  promise.then(renderMessages);
}

function renderMessages(messages){
    
  for (let i = 0; i < messages.data.length ; i++ ){

    if ( !arrayMessages.includes(messages.data[i]) ){

      arrayMessages.push(messages.data[i]);

      if (messages.data[i].type === typeStatus){

        main.innerHTML += 
          ` <div class="status">
              <p class="time">(${messages.data[i].time})</p>
              <p class="sender">${messages.data[i].from}</p>
              <p> ${messages.data[i].text}</p> 
            </div>`
  
      } else if (messages.data[i].type === typeMessage){
  
        main.innerHTML += 
          ` <div class="public-message">
              <p class="time">(${messages.data[i].time})</p>
              <p class="sender">${messages.data[i].from}</p>
              <p> para </p>
              <p class="receiver">${messages.data[i].to}</p>
              <p class="message"> ${messages.data[i].text}</p>  
            </div>`
  
      } else if (messages.data[i].to === "Todos" || messages.data[i].to === user) {
  
        main.innerHTML += 
          ` <div class="private-message">
              <p class="time">(${messages.data[i].time})</p>
              <p class="sender">${messages.data[i].from}</p>
              <p> reservadamente para </p>
              <p class="receiver">${messages.data[i].to}</p>
              <p class="message"> ${messages.data[i].text}</p>  
            </div>`
      }  
    }

  }

  scrollPage();
}

function scrollPage(){
  const lastMessage = document.querySelectorAll(".main div");
  lastMessage[lastMessage.length-1].scrollIntoView();
  //setInterval(getMessages, 3000); VERIFICAR
}

function keepConnected(){
  axios.post("https://mock-api.driven.com.br/api/v4/uol/status",{name: userName});
}

login(true);

