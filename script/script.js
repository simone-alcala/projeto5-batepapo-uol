const typeStatus         = "status";
const typeMessage        = "message";
const typePrivateMessage = "private_message";
const main               = document.querySelector(".main");
//const arrayMessages      = [];

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

function login(semErro){
  if (semErro){
    userName = prompt("Digite seu nome:");
  } else {
    userName = prompt("Usuário já está sala. Digite outro nome:");
  }
  validateUser();
}

function validateUser(){

  if (userName === "Todos"){
    login(false);
  }

  let promise = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants",{name: userName});
  
  promise.then(startChat);
  promise.catch(verifyLoginError);
 
}

function verifyLoginError(response){
  if (response.response.status === 400){
    login(false);
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
    
    response.then(verifySenMessageOk);
    response.catch(verifySenMessageError);
  }
}

function verifySenMessageOk(response){
  getMessages();
  document.querySelector("footer input").value = "";
}

function verifySenMessageError(response){
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

  if ( selection.classList.contains("send-private") ){
    sentType = typePrivateMessage;
  } else {
    sentType = typeMessage;
  }

  if ( selection.classList.contains("toAll") ){
    sentUser = "Todos";
  } else if ( selection.classList.contains("toSpecific") ){
    sentUser = selection.childNodes[2].textContent;
  }

  let textTypeMessage = ""

  if (sentType === typeMessage){
    textTypeMessage = "publicamente";
  } else {
    textTypeMessage = "reservadamente";
  }
/*
  if (sentUser !== "Todos"){
    if ( !verifyActiveUser() ){
      sentUser ="Todos";
    }
  }
*/
  if (sentType === typePrivateMessage || sentUser !== "Todos"){
    document.querySelector(".specificMessage").innerHTML = 
    `<p class="sentType " >Enviando para ${sentUser} (${textTypeMessage}) </p>`;
  } 
  
}

function getParticipants(){
   
  let promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants");
  
  promise.then(renderParticipants);
  promise.catch(verifyGetParticipantsError);
}

function renderParticipants(promise){

  arrayParticipants = promise.data;
  
  let participants = document.querySelector(".user-list");
   
  participants.innerHTML  = `<div class="checked toAll" onclick="chooseSentTypeUser(this,'user-list')">
                              <ion-icon name="people"></ion-icon> Todos <ion-icon name="checkmark-sharp"></ion-icon>
                            </div>`

                   
  for (let i = 0; i < promise.data.length ; i++){
    participants.innerHTML += `<div class="toSpecific" onclick="chooseSentTypeUser(this,'user-list')">
                                <ion-icon name="person-circle"></ion-icon> 
                                ${promise.data[i].name} 
                                <ion-icon name="checkmark-sharp"></ion-icon>
                              </div>`
  } 

}

function verifyGetParticipantsError(promise){
  console.log(promise);
}

function verifyActiveUser(){
  return arrayParticipants.includes(sentUser);
}

login(true);





