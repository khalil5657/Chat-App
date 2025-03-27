import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { RouterProvider, createBrowserRouter, Outlet, Link, useNavigate } from 'react-router-dom'
import Home from './home'
import SignUp from './signup'
import LogIn from './login'
import ShowSearch from './searchresults'
import ShowMessages from './showmessages'

import { io } from "socket.io-client"
import ShowProfile from './profile'

function RootLayout() {
  const [user, setUser] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchValue, setsearchValue] = useState('')
  const [chatUsers, setChatUsers] = useState([])
  const [chatUsersLastMessages, setChatUsersLastMessages] = useState({})
  const [chatUsersLastMessagesSeenByMe, setChatUsersLastMessagesSeenByMe] = useState({})
  const [update, setUpdate] = useState("")
  const [currentSocket, setCurrentSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const navigate = useNavigate()

  const selectedTheme = localStorage.getItem("theme")
  if (selectedTheme){
    document.querySelector("body").setAttribute("data-theme", selectedTheme)
  }
  
  useEffect(()=>{
    (
      async ()=>{
        // setLoading(true)
        const userRaw = await fetch(`${import.meta.env.VITE_FETCH_URL}/user`, {
          method:"GET",
          headers:{"Content-Type":"application/json"},
          credentials:"include"
        })
        const user = await userRaw.json()
        if (user.username){
          const chatUsersRaw = await fetch(`${import.meta.env.VITE_FETCH_URL}/chatusers/${user.id}`, {
            method:"GET",
            headers:{"Content-Type":"application/json"}
          })
          const chatUsers = await chatUsersRaw.json()
          setChatUsers(chatUsers)
          //// get last message of every user in chat and also last message i seen with the user
          let lastMessages = {}
          for (let chatuser of chatUsers){
            // console.log(user.id, chatuser.id)
            const lastMessageRaw =  await fetch(`${import.meta.env.VITE_FETCH_URL}/lastmessage/${user.id}/${chatuser.id}`, {
              method:"GET",
              headers:{"Content-Type":"application/json"}
            })
            const lastMessage = await lastMessageRaw.json()
            // console.log('opdkodkpd',lastMessage[lastMessage.length-1])
            lastMessages[chatuser.id] = lastMessage[lastMessage.length-1]
          }
          setChatUsersLastMessages(lastMessages)
          let lastMessagesSeenByMe = {}
          for (let chatuser of chatUsers){
            let lastseenmessagemodel = await fetch(`${import.meta.env.VITE_FETCH_URL}/getlastseen`, {
              method:"POST",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  byid:user.id, 
                  withid:chatuser.id
              })
            })
            lastseenmessagemodel = await lastseenmessagemodel.json()
            lastMessagesSeenByMe[chatuser.id] = lastseenmessagemodel.lastseenmessageid
          }
            setChatUsersLastMessagesSeenByMe(lastMessagesSeenByMe)
          ///
          setUser(user)
          connectSocket(user)
        }
        setLoading(false)
      }
    )()
  }, [update])

  

  async function logOut(){
    await fetch(`${import.meta.env.VITE_FETCH_URL}/logout`, {
      method:"POST",
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
    setUser("")
    disconnectSocket()
    return navigate("/")
  }

  function connectSocket(user){

    if (currentSocket){
      if (!user|| currentSocket.connected){
        return
      }
    }

    const socket = io(`${import.meta.env.VITE_FETCH_URL}`, {
      query:{
        userId:user.id
      }
    })
    socket.connect()
    setCurrentSocket(socket)

    socket.on("updateChatUsers", ()=>{
            setUpdate({})
        })

    socket.on("getOnlineUsers", (userIds)=>{
      setOnlineUsers(userIds)
    })
  }

  function disconnectSocket(){
    if (currentSocket){
      if (currentSocket.connected){
        currentSocket.disconnect()
      }
    }
  }

  function listUser(aUser){
    // const lastMessageRaw =  await fetch(`${import.meta.env.VITE_FETCH_URL}/lastmessage/${user.id}/${aUser.id}`, {
    //   method:"GET",
    //   headers:{"Content-Type":"application/json"}
    // })
    // const lastMessage = await lastMessageRaw.json()
    // console.log(lastMessage.content)
    // console.log(chatUsersLastMessages)
    
    function getTruncatedName(source) {
         let skippedString = source.trimEnd();
         if(skippedString.length > 18){
             return skippedString.substring(0, 18) + '...';
         }else{
             return source;
         }
    }
    return <div>
            <Link to={`/messages/${aUser.id}`}  className='chat-user'>

              {aUser.img?<div className='chat-user-image'>
                            <div style={{position:"relative"}}>
                              <img src={aUser.img.url} />
                              {onlineUsers.includes(aUser.id)?<span className='online-dot'></span>:<span className='offline-dot'></span>}
                            </div>
                          </div>:
                          <div className="chat-user-image">
                            <img src='https://res.cloudinary.com/dlwgxdiyp/image/upload/v1730058205/d76lwdwx5ojtcdk302eb.jpg'/>
                            {onlineUsers.includes(aUser.id)?<span className='online-dot'></span>:<span className='offline-dot'></span>}
                          </div>
              }

              <div className='chat-user-content'>
                <div className="chat-user-name">
                  {aUser.username}
                </div>
                {(chatUsersLastMessages[aUser.id])?
                <div className="last-chat-user-message">
                  {chatUsersLastMessages[aUser.id].file?
                    <p>sent a file</p> :
                    <p>{getTruncatedName(chatUsersLastMessages[aUser.id].content)}</p>}
                  
                </div>
                :''}
                {Object.keys(chatUsersLastMessagesSeenByMe).length>0?
                  <>
                    {chatUsersLastMessages[aUser.id]?
                      <>{chatUsersLastMessages[aUser.id].id!==chatUsersLastMessagesSeenByMe[aUser.id]&&<div className='new-messages'></div>}</>
                    :""}
                  </>
                  :""}
              </div>

            </Link>
            
          </div>
  }

  if (loading==true){
        return <div class="loader">
                    <div class="inner one"></div>
                    <div class="inner two"></div>
                    <div class="inner three"></div>
                </div>
    }

  return <div>
          {user&&<>
                  <nav>
                    <Link to="/" className='navhome'>Home</Link>
                    <div className="navsearch">
                      <input value={searchValue} onChange={(e)=>setsearchValue(e.target.value)}/>
                      <Link to={`/searchresults/${searchValue}`} className='Link' >Search</Link>
                    </div>
                    <div className="navbuttons">
                       <Link className='profile-button' to="/profile">{user.img?<img src={user.img.url}/>:<img src="https://res.cloudinary.com/dlwgxdiyp/image/upload/v1730058205/d76lwdwx5ojtcdk302eb.jpg" />}{user.username}</Link>
                      <button onClick={logOut} className='logout-button'>Log out</button>
                    </div>
                  </nav>
                  <div className='chat-users-container'> 
                    <h2>Chats:</h2>
                    <div className="new">
                      {chatUsers.length>0&&chatUsers.map((user)=>listUser(user))}
                    </div>
                    
                    
                  </div>
                  
                  <div className="navbuttons-sidebar">
                        <Link className='profile-button' to="/profile">{user.img?<img src={user.img.url}/>:<img src="https://res.cloudinary.com/dlwgxdiyp/image/upload/v1730058205/d76lwdwx5ojtcdk302eb.jpg" />}{user.username}</Link>
                        <button onClick={logOut} className='logout-button'>Log out</button>
                  </div>
                </>
          }
          <Outlet context={[user, setUser, setUpdate, currentSocket, onlineUsers ]} />
      </div>
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children:[
      {
        path:"/",
        element:<Home />
      },{
        path:"/signup",
        element:<SignUp />
      },
      {
        path:"/login",
        element:<LogIn />
      },
      {
        path:"/searchresults/:word",
        element:<ShowSearch />
      },
      {
        path:"/searchresults",
        element:<ShowSearch />
      },
      {
        path:"/messages/:id",
        element:<ShowMessages />
      },
      {
        path:"/profile",
        element:<ShowProfile />
      },
    ] 
  }
])

function App() {
  return (
    <div className='App'>
      <RouterProvider router={router} />
    </div>
  );
}

export default App
