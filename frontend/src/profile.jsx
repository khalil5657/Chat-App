import { useState } from "react"
import { useNavigate, useOutletContext } from "react-router"

function ShowProfile(){
    const [user, setUser, setUpdate] = useOutletContext()
    const [showEditForm, setShowEditForm] = useState(false)
    const [file, setFile]= useState("")
    const navigate = useNavigate()

    function handleSetShowEditForm(){
        if (showEditForm==false){
            setShowEditForm(true)
        }else{
            setShowEditForm(false)
        }
    }

    async function  updateProfile(e) {
        e.preventDefault()
        if (!file){
            return
        }
        const theFile = file;
        const formData = new FormData();
        formData.append('image', theFile);
        const raw = await fetch(`${import.meta.env.VITE_FETCH_URL}/addprofileimage/`+user.id, {
            method: 'POST',
            body:formData
        })
        
            return navigate("/")
        
    }
    function testa(theme){
        document.querySelector("body").setAttribute("data-theme", theme)
        localStorage.setItem("theme", theme)
    }

    return <div className="content">
            <div className="contain-them">
                
                <div className="profile-container">
                    <h1>{user.username}</h1>
                    {user.img?<img src={user.img.url} alt="" />:<img src="https://res.cloudinary.com/dlwgxdiyp/image/upload/v1730058205/d76lwdwx5ojtcdk302eb.jpg" alt="" />}
                    <div className="themes">
                        <button onClick={()=>testa("default")} className="default"></button>
                        <button onClick={()=>testa("light")} className="light"></button>
                        <button onClick={()=>testa("green")} className="green"></button>
                        <button onClick={()=>testa("blue")} className="blue"></button>
                    </div>
                </div>
                <div className="edit-profile-container">
                    <button onClick={()=>handleSetShowEditForm()}>Edit Avatar</button>
                    {showEditForm==true&&
                        <form onSubmit={updateProfile} encType="multipart/form-data">
                            <input type="file" name="picture" onChange={(e)=>setFile(e.target.files[0])} id="profile"/>
                            <button type="submit">Update Avatar</button>
                        </form>}
                </div>
        </div>
        
    </div>
}


export default ShowProfile