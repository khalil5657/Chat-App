import { useEffect, useState } from "react"
import { Link, useOutletContext } from "react-router"


function Home(){
    const [user, setUser] = useOutletContext()

    

    return <> {user?<div className="content">
                        <div className="home-page-container">
                    <h1>Welcome to <span>YaPPing!!</span></h1>
                    <p>The best Platform to perform your favorite hobby, 
                        Join the convesation in YaPPing and make new friends
                     or atleast try to :P<br/>Very easy sign-up </p>
                    <img src="/chat-chat-svgrepo-com.svg" alt="" style={{width:"40px", height:"40px"}} className="try"/>
                    </div>
                </div>
                :<div className="not-signed-home">
                    <div className="sign-methods">
                        <Link to="/login" className="Link">Login</Link><br />
                        <Link to="/signup" className="Link Link2">Sign up</Link>
                    </div>

                </div>
                }  
        </> 
}

export default Home