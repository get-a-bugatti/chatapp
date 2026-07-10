import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, Navigate, Outlet } from "react-router-dom";

 // Obsolete Protection (doesnot remember previous route)
// export default function Protected({
//     children,
//     authentication
// }) {

//     const navigate = useNavigate();
//     const [loader, setLoader] = useState(true);
//     const authStatus = useSelector(state => state.auth.status); 

    
//     useEffect(() => {
         
//         if (authentication !== authStatus) {
//             if (authentication) {
//                 navigate("/login")        
//             } else {
//                 navigate("/");
//             }
//         }

//         setLoader(false);
//     }, [authentication, authStatus, navigate])

//     return (
//         loader ? <div>Loading...</div> : <>{children}</>
//     )
// }


// New Protected Route (remembers previous routes)
export default function Protected({
     authentication
}) {

    const authStatus = useSelector(state => state.auth.status);
    const location = useLocation();
    const from = location.state?.from?.pathname || "/"; 

    if (authentication !== authStatus) {
        return authentication ? (<Navigate to="/login" state={{from: location}} replace />) : (<Navigate to={from} replace />)
    }

    return <Outlet />;
}