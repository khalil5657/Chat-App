import { useEffect, useState } from "react"
import { Link, useOutletContext, useParams } from "react-router"

function ShowSearch(){
    const { word } = useParams()
    const [users, setUsers] = useState([])
    const [user, setUser] = useOutletContext()
    const [loading, setLoading]  = useState(true)

    useEffect(()=>{
        (
            async ()=>{
                // if (word.length==0){
                //     return 
                // }
                const usersRaw = await fetch(`${import.meta.env.VITE_FETCH_URL}/users/${word}`, {
                    method:"GET",
                    headers:{"Content-Type":"appkication/json"}
                })
                const users = await usersRaw.json()
                setUsers(users)
                setLoading(false)
            }
        )()
    }, [word])

    function listIt(aUser){
        if (aUser.id!=user.id){
            return <Link className="user Link" to={`/messages/${aUser.id}`}>
                {aUser.img?<img src={aUser.img.url}/>:<img src="https://res.cloudinary.com/dlwgxdiyp/image/upload/v1730058205/d76lwdwx5ojtcdk302eb.jpg"/>}<h4>{aUser.username}</h4>
            </Link>
        }
        
    }
    if (loading==true){
        return <div class="loader">
                    <div class="inner one"></div>
                    <div class="inner two"></div>
                    <div class="inner three"></div>
                </div>
    }
    return <div className="content">
                <h1 className="search-results-title">Search results for "{word}"</h1>
                {users.length>0?<div className="users">{users.map(user=>listIt(user))}</div>:<h3>No users here!</h3>}
            </div>

}

export default ShowSearch