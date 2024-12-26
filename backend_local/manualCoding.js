const sendBoardtoApp = (globalVar, board) => {
    const ledPin = 13; 
    board.pinMode(ledPin, board.MODES.OUTPUT);

    setInterval(() => {
        board.digitalWrite(ledPin, board.HIGH); 

        setTimeout(() => {
            board.digitalWrite(ledPin, board.LOW); 
        }, 1000); 
    }, 2000); 

    setInterval(() => {
        globalVar.contador++
    }, 2000);
}

const sendBoardtoApp1 = (globalVar, board) => {
    const ledPin = 13; 
    board.pinMode(ledPin, board.MODES.OUTPUT);

    setInterval(() => {
        board.digitalWrite(ledPin, board.HIGH); 

        setTimeout(() => {
            board.digitalWrite(ledPin, board.LOW); 
        }, 1000); 
    }, 2000); 

    const pin = 7; 
    board.pinMode(pin, board.MODES.OUTPUT); 
  
    setInterval(() => {
      board.digitalWrite(pin, board.HIGH); 
      setTimeout(() => {
        board.digitalWrite(pin, board.LOW); 
      }, 1500); 
    }, 3000); 

    setInterval(() => {
    console.log(globalVar.contador);
    }, 2000);
}

export {
    sendBoardtoApp,
    sendBoardtoApp1
}