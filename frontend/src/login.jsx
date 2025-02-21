import { useState } from "react"
import { useNavigate, useOutletContext } from "react-router"
// LoginForm.js

import styled from 'styled-components';
import { FaUser, FaLock } from 'react-icons/fa';

const FormContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
`;

const FormWrapper = styled.div`
  background: #ffffff;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-10px);
  }
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  font-family: 'Roboto', sans-serif;
  margin-bottom: 30px;
  font-weight: 600;
  font-size: 24px;
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 40px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 30px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  background-color: #f9f9f9;

  &:focus {
    border-color: #2575fc;
    box-shadow: 0 0 5px rgba(37, 117, 252, 0.3);
  }

  &::placeholder {
    color: #bbb;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 15px;
  left: 15px;
  color: #aaa;
`;

const Button = styled.button`
  width: 100%;
  padding: 15px;
  background-color: #2575fc;
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #1a5ab8;
  }
`;

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Logging in with:', { username, password });
  };

  return (
    <FormContainer>
      <FormWrapper>
        <Title>Login</Title>
        <form onSubmit={handleSubmit}>
          <InputWrapper>
            <IconWrapper>
              <FaUser size={20} />
            </IconWrapper>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </InputWrapper>
          <InputWrapper>
            <IconWrapper>
              <FaLock size={20} />
            </IconWrapper>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputWrapper>
          <Button type="submit">Log In</Button>
        </form>
      </FormWrapper>
    </FormContainer>
  );
};

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

    return  <div className="sign-background">
                <div className="sign-form-container">
                    <h1 className="sign-form-title">Login</h1>
                    <form action="" onSubmit={logIn} className="login-form">
                        <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Username"/>
                        <input type="text" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password"/>
                        <button type="submit">Login!!</button>
                    </form>
                </div>
                
            </div>
}

export default LogIn