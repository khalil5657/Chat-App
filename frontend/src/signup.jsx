import { useState } from "react"
import { useNavigate, useOutletContext } from "react-router"

function SignUp(){
    const [user, setUser] = useOutletContext()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [file, setFile] = useState("")
    const navigate = useNavigate()

    async function signUp(e) {
        e.preventDefault()
        const res = await fetch(`${import.meta.env.VITE_FETCH_URL}/signup`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                username:username.trim(),
                password:password.trim(),
              })
        })
        const data = await res.json()

        if (file && data.username ){
            const theFile = file;
            const formData = new FormData();
            formData.append('image', theFile);
            const raw = await fetch(`${import.meta.env.VITE_FETCH_URL}/addprofileimage/`+data.id, {
                method: 'POST',
                body:formData
            })
        }
        if (data.username){
            return navigate("/login")
        }
    }

    return <div>
                <form action="" onSubmit={signUp} encType="multipart/form-data">
                    <label htmlFor="">Username</label>
                    <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)}/><br/>
                    <label htmlFor="">Password</label>
                    <input type="text" value={password} onChange={(e)=>setPassword(e.target.value)}/><br/>
                    <h4>Choose Profile Picture</h4>
                    <input type="file" name="picture" onChange={(e)=>setFile(e.target.files[0])} id="profile"/>
                    <button type="submit">Create Account!!</button>
                </form>
            </div>
}

export default SignUp