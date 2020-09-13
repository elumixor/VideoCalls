const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const PORT = 3000

const connections = {}

function checkConnection(id) {
    if (!connections[id]) {
        console.log(`Target ${id} is not logged in`)
        return false
    }

    return true
}

io.on('connection', connection => {
    console.log(`A user (${connection.id}) connected`)

    connection.on('echo', msg => {
        console.log(`[${connection.userID}] ${msg}`)
        connection.emit('message', '(echo): ' + msg)
    })

    connection.emit('login')

    connection.on('id', userID => {
        console.log(`Connection ${connection.id} was assigned an id ${userID}`)
        connection.userID = userID
        connections[userID] = connection
    })

    connection.on('call', ({targetID, webRTCData}) => {
        console.log(`Calling ${targetID} from ${connection.userID}`)
        if (!checkConnection(targetID)) return
        connections[targetID].emit('receive call', webRTCData)
    })

    connection.on('iceCandidate', ({targetID, candidate}) => {
        if (!checkConnection(targetID)) return
        connections[targetID].emit('iceCandidate', candidate)
    })
})

server.listen(PORT, () => {
    console.log('listening on localhost:' + PORT)
})
