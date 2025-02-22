import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useOutletContext, useParams } from "react-router"


function ShowMessages(){

    const [user, setUser, setUpdate, currentSocket, onlineUsers] = useOutletContext()
    const { id } = useParams()
    const [selectedUser, setSelectedUser] = useState("")
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [file, setFile] = useState("")
    const [addMessageForm, setAddMessageForm] = useState(true)
    const [readUntilIndex, setReadUntilIndex] = useState(0)
    const [lastSeenMessageByTheOther, setLastSeenMessageByTheOther] = useState("")
    const [checkSeenMessage, setCheckSeenMessage] = useState(true)
    const [updateLastSeenByMe, setUpdateLastSeenByMe] = useState("")
    const messagesEndRef = useRef()

    useEffect(()=>{
        (
            async ()=>{

                const userRaw = await fetch(`${import.meta.env.VITE_FETCH_URL}/user/${id}`, {
                    method:"GET",
                    headers:{"Content-Type":"application/json"}
                })
                const theUser = await userRaw.json()
                setSelectedUser(theUser)
                
                const messagesRaw = await fetch(`${import.meta.env.VITE_FETCH_URL}/messages`, {
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body:JSON.stringify({
                        userid:user.id,
                        withid:id
                    })
                })
                const messages = await messagesRaw.json()
                /// get last seen message id by me with the selected user and update it
                let lastseenmessagemodel = await fetch(`${import.meta.env.VITE_FETCH_URL}/getlastseen`, {
                    method:"POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        byid:user.id, 
                        withid:id
                    })
                })
                lastseenmessagemodel = await lastseenmessagemodel.json()

                if (lastseenmessagemodel.byid){
                    if (messages.length>0){
                        await fetch(`${import.meta.env.VITE_FETCH_URL}/updatelastseen`, {
                        method:"POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                                modelid:lastseenmessagemodel.id,
                                lastseenmessageid:messages[messages.length-1].id
                            })
                        })
                        setUpdate({})
                    }
                }else{
                    if (messages.length>0){
                        await fetch(`${import.meta.env.VITE_FETCH_URL}/createlastseen`, {
                        method:"POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                                byid:user.id, 
                                withid:id,
                                lastseenmessageid:messages[messages.length-1].id
                            })
                        })
                        setUpdate({})
                    }else{
                        await fetch(`${import.meta.env.VITE_FETCH_URL}/createemptylastseen`, {
                        method:"POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                                byid:user.id, 
                                withid:id,
                            })
                        })
                        setUpdate({})
                    }
                    
                }
                        setCheckSeenMessage(true)

                /////////// get selected user last seen message with me
                let lastSeenMessageByTheOtherRaw = await fetch(`${import.meta.env.VITE_FETCH_URL}/getlastseen`, {
                    method:"POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        byid:id, 
                        withid:user.id
                    })
                })
                const lastSeenMessageByTheOtherModel = await lastSeenMessageByTheOtherRaw.json()
                if (lastSeenMessageByTheOtherModel.withid){
                    setLastSeenMessageByTheOther(lastSeenMessageByTheOtherModel.lastseenmessageid)
                }else{
                    setLastSeenMessageByTheOther('')
                }
                setReadUntilIndex(0)
                ////////
                setMessages(messages)

                unsubscribeFromMessages()
                subscribeToMessages()

                setLoading(false)

                setTimeout(() => {
                    scrollToBottom()
                }, 500);
                
                return () => unsubscribeFromMessages()
            }
        )()
    }, [id])

    useEffect(()=>{
        setFile('')
        setMessage('')
        // setCheckSeenMessage(true)
        // unsubscribeFromMessages()
    }, [id])

    useEffect(()=>{
        (
            async () =>{
                let lastseenmessagemodel = await fetch(`${import.meta.env.VITE_FETCH_URL}/getlastseen`, {
                    method:"POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        byid:user.id, 
                        withid:id
                    })
                })
                lastseenmessagemodel = await lastseenmessagemodel.json()
                if (lastseenmessagemodel.byid&&messages.length>0){
                    await fetch(`${import.meta.env.VITE_FETCH_URL}/updatelastseen`, {
                        method:"POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                                modelid:lastseenmessagemodel.id,
                                lastseenmessageid:messages[messages.length-1].id
                            })
                        })
                }
            }
        )()
    }, [updateLastSeenByMe])

    async function sendMessage(e) {
        e.preventDefault()
        if (!file && !message){
            return
        }
        let newList = []
        let newMessage = ''
        let newOne = ''
        setAddMessageForm(false)
        if (message && file){
            /// if user sends a file and a message
            const messageRaw = await fetch(`${import.meta.env.VITE_FETCH_URL}/message`, {
            method:"POST",
            headers: {'Content-Type': 'application/json'},
            body:JSON.stringify({
                    message:message.trim(),
                    fromid:user.id,
                    toid:id
                    })
            })
            const newMessage = await messageRaw.json()
            //
            const theFile = file;
            const formData = new FormData();
            formData.append('image', theFile);
            const raw = await fetch(`${import.meta.env.VITE_FETCH_URL}/addmessagefile/`+newMessage.id+`/${id}`, {
                method: 'POST',
                body:formData
            })
            //
            newOne = await raw.json()
            newList = []
            newList = messages
            newList[newList.length] = newOne
            setMessages(newList)
            setMessage('')
            setFile('')
            setUpdate({})
            scrollToBottom()
        }
        if (message&&!file){
            /// if users sends a message without file
            const messageRaw = await fetch(`${import.meta.env.VITE_FETCH_URL}/message`, {
            method:"POST",
            headers: {'Content-Type': 'application/json'},
            body:JSON.stringify({
                    message:message.trim(),
                    fromid:user.id,
                    toid:id
                    })
            })
            newOne = await messageRaw.json()
            newList = []
            newList = messages
            newList[newList.length] = newOne
            setMessages(newList)
            setMessage('')
            setFile('')
            setUpdate({})
            scrollToBottom()
        }
        if (!message&&file){
            /// if user sends file without message
            const messageRaw = await fetch(`${import.meta.env.VITE_FETCH_URL}/message`, {
            method:"POST",
            headers: {'Content-Type': 'application/json'},
            body:JSON.stringify({
                    fromid:user.id,
                    toid:id
                    })
            })
            const newMessage = await messageRaw.json()
            //
            const theFile = file;
            const formData = new FormData();
            formData.append('image', theFile);
            const raw = await fetch(`${import.meta.env.VITE_FETCH_URL}/addmessagefile/`+newMessage.id+`/${id}`, {
                method: 'POST',
                body:formData
            })
            //
            newOne = await raw.json()
            newList = []
            newList = messages
            newList[newList.length] = newOne
            setMessages(newList)
            setMessage('')
            setFile('')
            setUpdate({})
            scrollToBottom()
        }
        //// updating last seen message by me
        let lastseenmessagemodel = await fetch(`${import.meta.env.VITE_FETCH_URL}/getlastseen`, {
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                byid:user.id, 
                withid:id
                })
        })
        lastseenmessagemodel = await lastseenmessagemodel.json()
        await fetch(`${import.meta.env.VITE_FETCH_URL}/updatelastseen`, {
                method:"POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelid:lastseenmessagemodel.id,
                    lastseenmessageid:newOne.id
            })
        })
        setUpdate({})
        setAddMessageForm(true)
        
    }

    function subscribeToMessages(){
        if (!id){
            return
        }
        const socket = currentSocket
        socket.on("newMessage", (data)=>{
            // console.log(id, data.newMessage.fromid)
            if (id!==data.newMessage.fromid){
                setUpdate({})
                return
            }
            // console.log(messages)
            // let newList = messages
            // newList.push(newMessage)
            // console.log(data.lista, 'ddd')
            setMessages(data.lista)
            setUpdateLastSeenByMe({})
            setUpdate({})
        })

        socket.on("newSeenMessage", (data)=>{
            if (id!==data.byid){
                // setUpdate({})
                return
            }
            setLastSeenMessageByTheOther(data.lastseenmessageid)
            setCheckSeenMessage(true)
        })
    }

    function unsubscribeFromMessages(){
        const socket = currentSocket
        socket.off("newMessage")
        socket.off("newSeenMessage")
    }

    const scrollToBottom = () => {
        window.requestAnimationFrame(
            function() {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
            });
    }

    function listIt(mes, index){
        
        if (lastSeenMessageByTheOther){
            if (lastSeenMessageByTheOther==mes.id&&checkSeenMessage==true){
                setReadUntilIndex(index)
                setCheckSeenMessage(false)
            }
        }
    
        let formatedDate = new Date(mes.sentdate).toString()
        let todayDate = new Date()

        let day = todayDate.getDate();
        let month = todayDate.getMonth() + 1;
        let year = todayDate.getFullYear();  
        let mesDay = new Date(mes.sentdate).getDate();
        let mesMonth = new Date(mes.sentdate).getMonth() + 1;
        let mesYear = new Date(mes.sentdate).getFullYear();

        let currentDate = `${day}-${month}-${year}`;
        let messageDate = `${mesDay}-${mesMonth}-${mesYear}`;

        formatedDate = formatedDate.split(" ")
        let hour = formatedDate[4].split(":")
        hour = hour[0].concat(hour[1]).toString()
        
        const isImage = ['gif','jpg','jpeg','png'];
        const isVideo =['mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'mp4']
        let state = ''
        function extension(fname) {
            return fname.slice((fname.lastIndexOf(".") - 1 >>> 0) + 2);
        }
        let ext = ''
        if (mes.file){
            ext = extension(mes.file.name)

            if (isImage.includes(ext)){
                state = "image"
            }else if (isVideo.includes(ext)){
                state = "video"
            }
        }

        return <div className={mes.fromid==user.id?"my-message":"their-message"}>
                        {/* {mes.id} */}
                        <div className={mes.fromid==user.id?"my-message-profile":"their-message-profile"}>
                            {mes.from.img?<img src={mes.from.img.url} />:<img src="https://res.cloudinary.com/dlwgxdiyp/image/upload/v1730058205/d76lwdwx5ojtcdk302eb.jpg" />}
                        </div>
                            <div className={state=="image"?"contains-file":state=="video"?"contains-file-video":"contain"}>
                                {state=="image"?<img className="message-file" src={mes.file.url} />:state=="video"?
                                <video className="message-file-video" controls >
                                    <source src={mes.file.url}/>
                                </video>:''}
                            {mes.content&&<h6 style={{margin:"0"}}>{mes.content}</h6>}
                            </div>
                    
                    {currentDate!=messageDate?
                            <p  className={mes.fromid==user.id?"date-my-message":"date-their-message"}>
                                {formatedDate[2]}{" "}
                                {formatedDate[1]}{" "}
                                {formatedDate[3]}{" "}
                                At:
                                {hour[0]}
                                {hour[1]}
                                :
                                {hour[2]}
                                {hour[3]}
                                {mes.fromid!=user.id?"":index<=readUntilIndex?<div className="read">✔✔</div>:<div className="unread">✔✔</div>}
                            </p>:
                            <p className={mes.fromid==user.id?"date-my-message":"date-their-message"}>
                                At:
                                {hour[0]}
                                {hour[1]}
                                :
                                {hour[2]}
                                {hour[3]}
                                {mes.fromid!=user.id?"":index<=readUntilIndex?<div className="read">✔✔</div>:<div className="unread">✔✔</div>}
                            </p>
                    }
                </div>

    }


    if (loading==true){
        return <div class="loader">
                    <div class="inner one"></div>
                    <div class="inner two"></div>
                    <div class="inner three"></div>
                </div>
    }
    return <div className="content">

                <div className="selected-chat-user">
                    <div className="selected-chat-user-image">
                        {selectedUser.img?<img src={selectedUser.img.url}/>:<img src="https://res.cloudinary.com/dlwgxdiyp/image/upload/v1730058205/d76lwdwx5ojtcdk302eb.jpg"/>}
                    </div>
                    <div className="selected-chat-user-name">
                        <span>{selectedUser.username}</span>
                    </div>
                    <div className="selected-chat-user-state">
                        {onlineUsers.includes(selectedUser.id)?<span className='online-state-dot'></span>:<span className='offline-state-dot'></span>}
                    </div>
                </div>

                {messages.length>0?
                    <div className="show-messages" style={{position:"relative"}}>
                        <div className="messages">
                            {messages.map((mes,ind)=>listIt(mes, ind))}
                            <div ref={messagesEndRef}></div>
                        </div>
                        {/* {addMessageForm==true&& */}
                        <form action="" onSubmit={sendMessage} encType="multipart/form-data" className={addMessageForm==false?"add-message-form unclick":"add-message-form"}>
                            <input type="text" onChange={(e)=>setMessage(e.target.value)} value={message} />
                            <label htmlFor="" for="profile">
                                <img src="/file-svgrepo-com.svg" alt="" />
                            </label> 
                            <input type="file" name="picture" onChange={(e)=>setFile(e.target.files[0])} id="profile" className="choose-file" />
                            <button type="submit">send</button>
                        </form>
                        {/* } */}
                    </div>:
                    <div>
                        <h3>No conversation between you two!!</h3>
                        <h4>Break the ice </h4>
                        <form action="" onSubmit={sendMessage} encType="multipart/form-data">
                            <input type="text" onChange={(e)=>setMessage(e.target.value)} value={message} />
                            <input type="file" name="picture" onChange={(e)=>setFile(e.target.files[0])} id="profile"/>
                            <button type="submit">send</button>
                        </form>
                    </div>
                }
            </div>
}

export default ShowMessages