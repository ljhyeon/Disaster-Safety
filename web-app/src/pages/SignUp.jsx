import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';

export function SignUp() {
    const navigate = useNavigate();
    return (
        <>
            <h2>SignUp Page</h2>
            <Button variant='contained' onClick={()=>{navigate('/login')}}>사용자 등록</Button>
        </>
    )
}