function S(){
        let adress
      if(location.protocol == 'https:'){
        adress = "ws://"+location.host+":80";
      }else{
        adress = "ws://"+location.host+":80";
      }

      this.ws = new WebSocket(adress);
      var self = this;
       this.ws.onopen = function() {
          
          $(document).ready(()=>{
            for(ready of self.readys){
              ready();
            }
            self.readys=null;
          });       

        };
       this.ws.onmessage = function (event) { 
          data = JSON.parse(event.data);
          if(data.messageType == "location"){
          //automaticly redirect if told by the server
            location.pathname = data.messageData;
          }
          for(handel of self.receiveMessageHandlers){//call the correct handlers for this type of rquest
            if(handel.messageType == data.messageType){
              if(data.messageData != undefined && data.messageData != null){
                handel.function(data.messageData);
              }else{
                handel.function();
              }
            }
          }
       };
       this.ws.onclose = function() { 
          for(handel of self.receiveMessageHandlers){
            if(handel.messageType == "close"){
                handel.function();
            }
          }
          setTimeout(()=>{location.reload()},1000)//this works 
          //refresh the page if connection is lost or 
          //closed after all the closing funtions are done.
          //wait becuase there might be one last message waiting to be recvied like the replaced one.
       };
       this.readys = [];
       this.ready = (func)=>{
        if(this.readys){
          this.readys.push(func);
        }else{
          func();
        }
        
       }
       this.sendMessage = (messageType,messageData)=>{
        message = {messageType:messageType}
        if(messageData != undefined && message != null){
          message.messageData = messageData;
        }
        message = JSON.stringify(message);
        this.ws.send(message);
       };
      this.receiveMessageHandlers = [];//{messageType,function}  function(data)
      this.addReceiveMessageHandler =(messageType,handler)=>{
        this.receiveMessageHandlers.push({messageType:messageType,function:handler});
      }
    }
    const Server = new S();