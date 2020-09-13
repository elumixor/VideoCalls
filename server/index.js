const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const PORT = 3000
let id = 0

const connections = {}

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

    connection.on('call', ({targetId, webRTCData}) => {
        console.log(`Calling ${targetId} from ${connection.userID}`)
        if (!connections[targetId]) {
            console.log(`Target ${targetId} is not logged in. Call failed.`)
            return
        }
        connections[targetId].emit('receive call', {})
    })
})

server.listen(PORT, () => {
    console.log('listening on localhost:' + PORT)
})
