const typeStatus         = "status";
const typeMessage        = "message";
const typePrivateMessage = "private_message";
const main               = document.querySelector(".main");

let   arrayOldMsg        = [];
let   userName           = null;
let   setUpdateNewMsg    = true;
let   sentType           = typeMessage;
let   sentUser           = "Todos";
let   arrayParticipants  = [];

document.querySelector("section input").focus();
document.querySelector("footer input").value = "";

document.querySelector("section input").addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13){
    loginChat();
  }
});

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
  document.querySelector(".loading").classList.remove("hidden");

  setTimeout(loadPage,3000)
}

function loadPage(){
  document.querySelector(".loading").classList.add("hidden");
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
  promise.catch(renderMessages);
}

function renderMessages(messages){

  let renderMessage = messages.data.filter(filterMessages);

  let textTypeMessage = ""

  if (sentType === typeMessage){
    textTypeMessage = "publicamente";
  } else {
    textTypeMessage = "reservadamente";
  }

  document.querySelector(".specificMessage").innerHTML = 
    `<p class="sentType " >Enviando para ${sentUser} (${textTypeMessage}) </p>`;

 // main.innerHTML = "";

  renderMessage.forEach(message => {

    if (message.type === typeStatus){

      main.innerHTML += 
        ` <div class="status" data-identifier="message">
            <p class="time">(${message.time})</p>
            <p class="sender">${message.from}</p>
            <p> ${message.text}</p> 
          </div>`

    } else if (message.type === typeMessage){

      main.innerHTML += 
        ` <div class="public-message" data-identifier="message">
            <p class="time">(${message.time})</p>
            <p class="sender">${message.from}</p>
            <p> para </p>
            <p class="receiver">${message.to}</p>
            <p class="message"> ${message.text}</p>  
          </div>`

    } else if ( showPrivateMessages(message) ) {

      main.innerHTML += 
        ` <div class="private-message" data-identifier="message">
            <p class="time">(${message.time})</p>
            <p class="sender">${message.from}</p>
            <p> reservadamente para </p>
            <p class="receiver">${message.to}</p>
            <p class="message"> ${message.text}</p>  
          </div>`
    }  

  });
    
  arrayOldMsg = [...messages.data];
  
  scrollPage();
  
  if (setUpdateNewMsg){
    getNewMessages();
  }
}

function filterMessages(newMessage){
  return !arrayOldMsg.some( item => item.time === newMessage.time ); 
}

function showPrivateMessages( message ){
  return (message.to === "Todos" || message.to === userName || message.from === userName);
}

function getMessagesError(promise){
  console.log(promise);
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
  setVisibityAndUser(selection);
}

function setVisibityAndUser(selection){
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

  
  participants.innerHTML  = `<div class="send toAll" onclick="chooseSentTypeUser(this,'user-chat')" data-identifier="participant">
                              <div><ion-icon name="people"></ion-icon> <p>Todos </p></div>
                              <ion-icon name="checkmark-outline"></ion-icon>
                            </div>`                       

  let classChecked = "";

  promise.data.forEach(item => {

    if (sentUser === item.name ) {
      classChecked = "checked";
    } else {
      classChecked = "";
    }

    participants.innerHTML +=  `<div class="send toSpecific ${classChecked}" onclick="chooseSentTypeUser(this,'user-chat')" data-identifier="participant">
                                  <div><ion-icon name="person-circle"></ion-icon> 
                                    <p>${item.name} </p>
                                  </div>
                                  <ion-icon name="checkmark-outline"></ion-icon>
                                </div> `
  });      

  if (!verifyActiveUser()) {
    sentUser = "Todos";
  }

  if ( sentUser === "Todos") {
    document.querySelector(".toAll").classList.add("checked");
  }    

}

function verifyGetParticipantsError(promise){
  console.log(promise);
}

function verifyActiveUser(){
  return arrayParticipants.some(checkUser => checkUser.name === sentUser);
}



