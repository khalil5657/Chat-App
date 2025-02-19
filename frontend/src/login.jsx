import { useState } from "react"
import { useNavigate, useOutletContext } from "react-router"

function LogIn(){
    const [user, setUser, setUpdate] = useOutletContext()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    async function logIn(e) {
        e.preventDefault()
        const res = await fetch(`${import.meta.env.VITE_FETCH_URL}/login`, {
              method:"POST",
                headers: {'Content-Type': 'application/json'},
                credentials:"include",
                body: JSON.stringify({
                    username:username.trim(),
                    password:password.trim(),
                })
            })
        const data = await res.json()

        if (data.username){
            setUser(data)
            setUpdate({})
            return navigate("/")
        }
    }

    return <div >
                <form action="" onSubmit={logIn} >
                    <label htmlFor="">Username</label>
                    <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)}/><br/>
                    <label htmlFor="">Password</label>
                    <input type="text" value={password} onChange={(e)=>setPassword(e.target.value)}/><br/>
                    <button type="submit">Login!!</button>
                </form>
            </div>
}

export default LogIn