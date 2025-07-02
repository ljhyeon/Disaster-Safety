import { useNavigate } from "react-router-dom"

import { Button } from "@mui/material"

export function Home() {
    const navigate = useNavigate();

    return (
        <>
            <h2>Home Page</h2>
            <Button variant='contained' onClick={()=>navigate('/supply/1')}>1번 대피소</Button>
        </>
    )
}