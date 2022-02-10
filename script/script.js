let   userName           = null;
let   setUpdateNewMsg    = true;

const typeStatus         = "status";
const typeMessage        = "message";
const typePrivateMessage = "private_message";
const main               = document.querySelector(".main");
const arrayMessages      = [];

function login(semErro){
  if (semErro){
    userName = prompt("Digite seu nome:");
  } else {
    userName = prompt("Usuário já está sala. Digite outro nome:");
  }
  validateUser();
}

function validateUser(){
  let promise = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants",{name: userName});
  
  promise.then(getMessages);
  promise.catch(verifyLoginError);
 
}

function verifyLoginError(response){
  if (response.response.status === 400){
    login(false);
  }
}

function getMessages(){

  document.querySelector("footer input").focus();

  let promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");
  promise.then(renderMessages);
}

function renderMessages(messages){

  main.innerHTML = "";
    
  for (let i = 0; i < messages.data.length ; i++ ){

    //if ( !arrayMessages.includes(messages.data[i]) ){

      //arrayMessages.push(messages.data[i]);

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
  
      } else if (messages.data[i].to === "Todos" || messages.data[i].to === userName) {
  
        main.innerHTML += 
          ` <div class="private-message">
              <p class="time">(${messages.data[i].time})</p>
              <p class="sender">${messages.data[i].from}</p>
              <p> reservadamente para </p>
              <p class="receiver">${messages.data[i].to}</p>
              <p class="message"> ${messages.data[i].text}</p>  
            </div>`
      }  
    //}

  }
  scrollPage();
  
  if (setUpdateNewMsg){
    getNewMessages();
  }
}

function scrollPage(){
  const lastMessage = document.querySelectorAll(".main div");
  lastMessage[lastMessage.length-1].scrollIntoView();
}

function getNewMessages(){
  setUpdateNewMsg = false;
  setInterval(getMessages, 3000); 
  setInterval(keepConnected,5000);
}

function keepConnected(){
  let response = axios.post("https://mock-api.driven.com.br/api/v4/uol/status",{name: userName});
  
  response.then(verifyKeepConnectedOk);
  response.catch(verifyKeepConnectedError);
}

function verifyKeepConnectedOk(response){
  console.log(response);
}

function verifyKeepConnectedError(response){
  console.log(response);
}

function sendMessage(){
  let message = document.querySelector("footer input").value;

  if (message !== ""){

    let messageObj = 
      { from: userName,
        to: "Todos", 
        text: message,
        type: "message"
      };

    let response = axios.post ("https://mock-api.driven.com.br/api/v4/uol/messages", messageObj);
    
    response.then(verifySenMessageOk);
    response.catch(verifySenMessageError);
  }
}

document.querySelector("footer input").addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13){
    sendMessage();
  }
});


function verifySenMessageOk(response){
  getMessages();
  document.querySelector("footer input").value = "";
}

function verifySenMessageError(response){
  window.location.reload();
  console.log(response.response);
}

login(true);






