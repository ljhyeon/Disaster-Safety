import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';

export function Login() {
    const navigate = useNavigate();
    return (
        <>
            <h2>Login Page</h2>
            <Button onClick={()=>{navigate('/signup')}}>사용자 등록</Button>
            <Button variant='contained' onClick={()=>{navigate('/home')}}>로그인</Button>
        </>
    )
}