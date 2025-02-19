import express from "express"
import { app, getReceiverSocketId, io, server } from "./socket.js"
import { Server } from "socket.io";

import cookieParser from "cookie-parser"

import dotenv from "dotenv"


dotenv.config();

app.use(express.json())
app.use(cookieParser())
app.set("trust proxy", 1);




import bcrypt from "bcryptjs"

import fs from "fs"

import jwt from "jsonwebtoken"



import { v2 as cloudinary } from "cloudinary";

import multer from "multer"

const upload = multer({ dest: 'uploads/' })


import cors from "cors"

app.use(cors({
    origin: "http://localhost:5173",
    methods : ["PUT", "DELETE", "POST", "GET"],
    credentials: true
}))


import { PrismaClient } from "@prisma/client"
import { type } from "os";

const prisma = new PrismaClient()

app.get("/", (req, res)=>{
    res.send("hello")
})

app.post("/signup", async (req, res)=>{
    const { username, password } = req.body
    try{
        
        const existingUser = await prisma.user.findUnique({
        where: {
            username: username
            }
        })
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                username: username,
                password: hashedPassword,
            }
            })
        res.send(user)
    }catch{
        res.send("problem")
    }
})

app.post("/addprofileimage/:id", upload.single("image"), async(req, res)=>{
    const { originalname, size, path } = req.file;
    try{
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret :process.env.API_SECRET
        });
        const results = await cloudinary.uploader.upload(path, {resource_type: 'auto'})
        await prisma.user.update({
        where:{
            id: req.params.id
        },
        data:{
            img:{
                create:{
                    name: originalname,
                    url: results.secure_url
            }
            }
        }
        })
        // Clear temporary local download
        fs.unlinkSync(path);
        res.send({message:"success"})
    }catch(error){
      res.send({message:'unsucsessfull'})
    }
})

app.post("/login", async (req, res) => {
    const { username, password } = req.body
    try {
      const user = await prisma.user.findUnique({
        where: { username },
        include:{
            img:true
        }
      })
      if (!user) {
        return res.status(400).json({ message: 'User doesnt exist.' })
      }
      
      const isMatch = await bcrypt.compare(password, user.password)
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials.' })
      }
  
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.SECRET,
        // { expiresIn: '1h' }
      )
      res.cookie('jwt', token, {
        httpOnly:true,
        maxAge: 24 *60 *60 * 1000,
        sameSite:"none",
          secure:true
      })
      res.json(user)
    }catch (error) {
      res.status(402).json({ message: 'Server error.', error: error.message })
    }
})

app.post("/logout", (req, res)=>{
    res.cookie("jwt", "", {
        maxAge:0, httpOnly:true,
        sameSite:"none",
        secure:true}
    )
    res.send({message:"secsess"})
})

//// cookie stays on the page url or origin cokkies in the browser
app.get("/user", async(req, res)=>{
    try{
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, process.env.SECRET)
        if (!claims){
            return res.status(404).send({message:"unauthenticated"})
        }
        const user = await prisma.user.findUnique({
            where:{
                id:claims.userId
            },
            include:{
              img:true,
            }
        })
        res.send(user)

    }catch{
        return res.status(404).send({message:"something went wrong"})
    }
})

app.get("/users/:word", async(req, res)=>{
    const users = await prisma.user.findMany({
        where:{
            username:{
                contains:req.params.word,
                mode:"insensitive"
            },
        },
        include:{
            img:true
        }
        
    })
    res.send(users)
})

app.post("/messages", async (req, res)=>{
    const messages = await prisma.message.findMany({
        where:{
            OR:[
                {fromid:req.body.userid, toid:req.body.withid},
                {fromid:req.body.withid, toid:req.body.userid}
            ]
        },
        orderBy:[
            {
                sentdate:"asc"
            }
        ],
        include:{
            file:true,
            from:{
                include:{
                    img:true
                }
            }
        }
    })
    res.send(messages)
})

app.post("/message", async(req, res)=>{
    const newMessage = await prisma.message.create({
        data:{
            content:req.body.message,
            fromid:req.body.fromid,
            toid:req.body.toid
        },
        include:{
            file:true,
            from:{
                include:{
                    img:true
                }
            }
        }
    })
    const lista = await prisma.message.findMany({
        where:{
            OR:[
                {fromid:req.body.fromid, toid:req.body.toid},
                {fromid:req.body.toid, toid:req.body.fromid}
            ]
        },
        include:{
            file:true,
            from:{
                include:{
                    img:true
                }
            }
        },
        orderBy:[
            {
                sentdate:"asc"
            }
        ],
        
    })
    const receiverScoketId = getReceiverSocketId(req.body.toid)
    if (receiverScoketId){
        io.to(receiverScoketId).emit("newMessage", {lista:lista, newMessage:newMessage})
        io.to(receiverScoketId).emit("updateChatUsers")
    }

    res.send(newMessage)
})

app.post("/addmessagefile/:id/:toid", upload.single("image"), async(req, res)=>{
    const { originalname, size, path } = req.file;
    try{
        cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret :process.env.API_SECRET
    });
    const results = await cloudinary.uploader.upload(path, {resource_type: 'auto'})
    const message = await prisma.message.update({
      where:{
        id: req.params.id
      },
      data:{
        file:{
          create:{
            name: originalname,
            url: results.secure_url
          }
        }
      },
      include:{
        file:true,
        from:{
            include:{
                img:true
            }
        }
      }
    })
    // Clear temporary local download
    fs.unlinkSync(path);

    const lista = await prisma.message.findMany({
        where:{
            OR:[
                {fromid:message.fromid, toid:req.params.toid},
                {fromid:req.params.toid, toid:message.fromid}
            ]
        },
        include:{
            file:true,
            from:{
                include:{
                    img:true
                }
            }
        },
        orderBy:[
            {
                sentdate:"asc"
            }
        ],
        
    })

    const receiverScoketId = getReceiverSocketId(req.params.toid)
    if (receiverScoketId){
        io.to(receiverScoketId).emit("newMessage", {lista:lista, newMessage:message})
    }

    res.send(message)
    }catch(error){
      console.log(error)
      res.send({message:'unsucsessfull'})
    }
})

app.get("/chatusers/:id", async(req, res)=>{
    const allMessages = await prisma.message.findMany({
        where:{
            OR:[
                {fromid:req.params.id},
                {toid:req.params.id}
            ]
        },
        orderBy:[
            {
                sentdate:"desc"
            }
        ]
    })
    let usersIds = []
    for (let message of allMessages){
        if (message.fromid==req.params.id){
            if (!usersIds.includes(message.toid)){
                usersIds.push(message.toid)
            }
        }else{
            if (!usersIds.includes(message.fromid)){
                usersIds.push(message.fromid)
            }
        }
    }
    const users = []
    for (let userid of usersIds){
        const aUser = await prisma.user.findUnique({
            where:{
                id:userid
            },
            include:{
                img:true
            }
        })
        users.push(aUser)
    }
    
    res.send(users)
})

app.get("/lastmessage/:userid/:otherid", async(req, res)=>{
    const messages = await prisma.message.findMany({
            where:{
                OR:[
                    {fromid:req.params.userid, toid:req.params.otherid},
                    {fromid:req.params.otherid, toid:req.params.userid}
                ]
            },
            include:{
                file:true
            },
            orderBy:[
                {
                    sentdate:"asc"
                }
            ],
            
        })
        
        res.send(messages)
})

app.get("/user/:id", async(req, res)=>{
    const user = await prisma.user.findUnique({
        where:{
            id:req.params.id
        },
        include:{
            img:true
        }
    })
    res.send(user)
})

app.post("/createlastseen", async(req, res)=>{
    const lastseen = await prisma.lastSeenMessages.create({
        data:{
            byid:req.body.byid,
            withid:req.body.withid,
            lastseenmessageid:req.body.lastseenmessageid
        }
    })
    const receiverScoketId = getReceiverSocketId(req.body.withid)
    if (receiverScoketId){
        io.to(receiverScoketId).emit("newSeenMessag", lastseen)
    }
    res.send(lastseen)
})

app.post("/updatelastseen", async(req, res)=>{
    const lastseen = await prisma.lastSeenMessages.update({
        where:{
            id:req.body.modelid
        },
        data:{
            lastseenmessageid:req.body.lastseenmessageid
        }
    })
    const receiverScoketId = getReceiverSocketId(lastseen.withid)
    if (receiverScoketId){
        io.to(receiverScoketId).emit("newSeenMessage", lastseen)
    }
    res.send(lastseen)
})

app.post("/getlastseen", async(req, res)=>{

    const lastseenarray = await prisma.lastSeenMessages.count({
        where:{
            byid:req.body.byid,
            withid:req.body.withid
        }
    })

    if (lastseenarray>0){
        let lastseenmodel = await prisma.lastSeenMessages.findMany({
            where:{
                byid:req.body.byid,
                withid:req.body.withid
            }
        })
        res.send(lastseenmodel[0])
    }else{
        res.json({message:"no"})
    }
})

app.post("/createemptylastseen", async(req, res)=>{
    const lastseen = await prisma.lastSeenMessages.create({
        data:{
            byid:req.body.byid,
            withid:req.body.withid,
        }
    })
    res.send(lastseen)
})

server.listen(3030)
