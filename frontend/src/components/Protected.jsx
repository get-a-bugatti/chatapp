import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


export default function Protected({
    children,
    authentication
}) {

    const navigate = useNavigate();
    const [loader, setLoader] = useState(true);
    const authStatus = useSelector(state => state.auth.status); 

    
    useEffect(() => {
         
        if (authentication !== authStatus) {
            if (authentication) {
                navigate("/login")        
            } else {
                navigate("/");
            }
        }

        setLoader(false);
    }, [authentication, authStatus, navigate])

    return (
        loader ? <div>Loading...</div> : <>{children}</>
    )
}