const typeStatus         = "status";
const typeMessage        = "message";
const typePrivateMessage = "private_message";
const main               = document.querySelector(".main");

let   userName           = null;
let   setUpdateNewMsg    = true;
let   sentType           = typeMessage;
let   sentUser           = "Todos";
let   arrayParticipants  = [];

document.querySelector("footer input").addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13){
    sendMessage();
  }
});

function loginChat(){
  userName = document.querySelector(".login input").value;
  validateUser();
}

function validateUser(){

  let errorMessage = document.querySelector(".login .errorMessage");

  if (userName === "Todos"){
    errorMessage.innerHTML = "Não é possível acessar com o nome TODOS. Digite outro nome.";
    return null;
  }

  let promise = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants",{name: userName});
  
  promise.then(loginOk);
  promise.catch(verifyLoginError);

}

function loginOk(){
  document.querySelector(".login input").value = "";
  document.querySelector(".login").classList.add("hidden");
  startChat();
}

function verifyLoginError(response){

  let errorMessage = document.querySelector(".login .errorMessage");

  if (response.response.status === 400){
    errorMessage.innerHTML = "Usuário já está na sala. Digite outro nome.";
  } else {
    console.log(response.response);
    errorMessage.innerHTML = "Ocorreu um erro. Tente novamente mais tarde.";
  }
}

function startChat(){
  getMessages();
  getParticipants();
}

function getMessages(){
  document.querySelector("footer input").focus();
  let promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");
  promise.then(renderMessages);
}

function renderMessages(messages){

  let textTypeMessage = ""

  if (sentType === typeMessage){
    textTypeMessage = "publicamente";
  } else {
    textTypeMessage = "reservadamente";
  }

  document.querySelector(".specificMessage").innerHTML = 
    `<p class="sentType " >Enviando para ${sentUser} (${textTypeMessage}) </p>`;

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
  
      } else if (messages.data[i].to === "Todos" || messages.data[i].to === userName || messages.data[i].from === userName)  {
  
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
  setInterval(getParticipants,10000);
}

function keepConnected(){
  let response = axios.post("https://mock-api.driven.com.br/api/v4/uol/status",{name: userName});
  
  response.then(verifyKeepConnectedOk);
  response.catch(verifyKeepConnectedError);
}

function verifyKeepConnectedOk(response){
  //console.log(response);
}

function verifyKeepConnectedError(response){
  console.log(response);
}

function sendMessage(){

  let message = document.querySelector("footer input").value;

  if (message !== ""){

    let messageObj = 
      { from: userName,
        to:   sentUser, 
        text: message,
        type: sentType
      };

      console.log(messageObj);

    let response = axios.post ("https://mock-api.driven.com.br/api/v4/uol/messages", messageObj);
    
    response.then(verifySendMessageOk);
    response.catch(verifySendMessageError);
  }
}

function verifySendMessageOk(response){
  getMessages();
  document.querySelector("footer input").value = "";
}

function verifySendMessageError(response){
  document.querySelector("footer input").value = "";
  window.location.reload();
  console.log(response.response);
}

function closeSideBar(){
  document.querySelector("aside").classList.add("hidden");
}

function openSideBar(){
  document.querySelector("aside").classList.remove("hidden");
}

function chooseSentTypeUser(selection,checkType){

  if (!selection.classList.contains("checked")){
    document.querySelector("."+checkType+" .checked").classList.remove("checked");
    selection.classList.add("checked");
  }

  if ( selection.classList.contains("private") ){
    sentType = typePrivateMessage;
  } else if ( selection.classList.contains("public") ){
    sentType = typeMessage;
  } else if ( selection.classList.contains("toAll") ){
    sentUser = "Todos";
  } else if ( selection.classList.contains("toSpecific") ){
    sentUser = selection.querySelector("p").innerText;
  }

}

function getParticipants(){
   
  let promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants");
  
  promise.then(renderParticipants);
  promise.catch(verifyGetParticipantsError);
}

function renderParticipants(promise){

  arrayParticipants = promise.data;
  
  let participants = document.querySelector(".user-chat");
   
  participants.innerHTML  = `<div class="send checked toAll" onclick="chooseSentTypeUser(this,'user-chat')">
                              <div><ion-icon name="people"></ion-icon> <p>Todos </p></div>
                              <ion-icon name="checkmark-outline"></ion-icon>
                            </div>`

                   
  for (let i = 0; i < promise.data.length ; i++){
    participants.innerHTML += `<div class="send toSpecific" onclick="chooseSentTypeUser(this,'user-chat')">
                                <div><ion-icon name="person-circle"></ion-icon> 
                                  <p>${promise.data[i].name} </p>
                                </div>
                                <ion-icon name="checkmark-outline"></ion-icon>
                              </div>`
  } 

  if (!verifyActiveUser()) {
    sentUser = "Todos";
  }

}

function verifyGetParticipantsError(promise){
  console.log(promise);
}

function verifyActiveUser(){
  return arrayParticipants.some(checkUser => checkUser.name === sentUser);
}



