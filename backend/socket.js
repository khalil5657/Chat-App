import { Server } from "socket.io"
import http from "http"
import express from "express"
import exp from "constants"
import { Socket } from "dgram"

const app = express()

const server = http.createServer(app)
let originUrl = ''

if (process.env.state=="dev"){
    originUrl = process.env.DEV_FRONTEND_URL
}else{
    originUrl = process.env.PROD_FRONTEND_URL
}

const io = new Server(server, {
     cors:{
        origin: [originUrl],
        // methods : ["PUT", "DELETE", "POST", "GET"],
        // credentials: true
     }
})

export function getReceiverSocketId(userId){
    return userSocketMap[userId]
}

const userSocketMap = {}

io.on("connection", (socket) =>{
    console.log("user connected", socket.id)

    const userId = socket.handshake.query.userId
    if (userId){
        userSocketMap[userId] = socket.id
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", ()=>{
        console.log("a user disconnected", socket.id)
        delete userSocketMap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

export {io, app, server}
