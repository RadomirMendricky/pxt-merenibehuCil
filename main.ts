radio.setTransmitPower(7);
//radio.setFrequencyBand(1);
radio.setTransmitSerialNumber(true);
radio.setGroup(29);

let kod = 0
let LL = 180
let time = 0
let stopky = false
let timeAndReactionTime = 0
let stopkyReact = false
let reactionTime = 0
let stopkyNow = false
let length = 15 //DÉLKA BĚHU 
let speed = 0
let measuring = false


/*
1 = kalibrace
2 = stopky - průběh
3 = stopky - planovanej start
4 = vyžádání dat
*/

function kalibrace(): number {
    basic.pause(500)
    const kalibraceLL: number[] = []
    for (let i = 0; i < 20; i++) {
        basic.clearScreen()
        kalibraceLL.push(input.lightLevel())
        basic.pause(100)
    }
    let soucet = 0
    for (const value of kalibraceLL) {
        soucet += value
    }
    return (soucet / 20)
}


radio.onReceivedNumber(function (receivedNumber: number) {
    kod = receivedNumber
    //console.log(receivedNumber)
})

basic.forever(function () {
    if (kod == 1 && !stopkyNow) {
        LL = kalibrace()
        basic.showString("K")
        basic.clearScreen()
        kod = 0
    }

    if (kod == 2) {
        stopky = true
        stopkyNow = true
        control.inBackground(function () {
            while (stopky) {
                time++
                basic.pause(10)
            }


        })
            basic.showString("P")
            basic.clearScreen()
            kod = 0
    }

    if (kod == 3) {
        kod = 0
        time = 0
        timeAndReactionTime = 0
        reactionTime = 0 
        speed = 0

        measuring = true
        stopkyReact = true
        stopkyNow = true
        control.inBackground(function () {
            while (stopkyReact) {
                timeAndReactionTime++
                basic.pause(10)
            }
            
            
        })
        basic.showString("R")
        basic.clearScreen()
        kod = 0
    }

    if (measuring && input.lightLevel() <= LL / 2) {
        stopky = false
        stopkyReact = false
        stopkyNow = false
        radio.sendNumber(5)
        time = time / 100
        timeAndReactionTime = timeAndReactionTime / 100
        speed = 3.6*(length/time)
        reactionTime = (timeAndReactionTime - time)
        basic.showString("C")
        basic.clearScreen()
    }

    if (kod == 4) {
        
        if (!stopkyNow) {
            radio.sendValue("T", time)
            radio.sendValue("R", reactionTime)
            radio.sendValue("S", speed)
            kod = 0
            basic.showString("T:")
            basic.showNumber(time)
            basic.showString("R:")
            if (reactionTime < 0) {
                basic.showString("Early start")
            } else {
                basic.showNumber(reactionTime)
            }
            basic.showString("S:")
            basic.showNumber(speed)
        }


    }

})

input.onButtonPressed(Button.B, function () {
    if (!stopkyNow) {
        basic.showString("T:")
        basic.showNumber(time)
        basic.showString("R:")
        if (reactionTime < 0) {
            basic.showString("Early start")
        } else {
            basic.showNumber(reactionTime)
        }
        basic.showString("S:")
        basic.showNumber(speed)
    }

})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (!stopkyNow) {
        LL = kalibrace()
        basic.showString("K")
        basic.clearScreen()
    }
})

