import { useEffect } from "react"
import { Link, useOutletContext } from "react-router"


function Home(){
    const [user, setUser] = useOutletContext()

    

    return <div className="content">
                {user?<div className="home-page-container">
                    <h1>Welcome to <span>YaPPing!!</span></h1>
                    <p>The best Platform to perform your favorite hobby, 
                        Join the convesation in YaPPing and make new friends
                     or atleast try to :P<br/>Very easy sign-up </p>
                    <img src="/chat-chat-svgrepo-com.svg" alt="" style={{width:"40px", height:"40px"}} className="try"/>
                </div>
                :<div>
                    <Link to="/login">Login</Link><br />
                    <Link to="/signup">Sign up</Link>
                </div>
                }   
            </div>
}

export default Home