import { AiFillMessage } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

export default function UserBox({
    user,
    className
}) {
    const navigate = useNavigate();

    function handleChatClick() {
        navigate(`/private/${user._id}`);
    }

    return (
        <div className={`userbox-container flex flex-row border-2 rounded-lg border-white px-4 py-2 ${className}`}>
            <div className="image-container w-[50px] h-[50px] mr-10">
                <img src={user.avatar} alt="user image" className="object-cover rounded-full" />
            </div>
            <div className="userinfo-container flex flex-row align-center justify-between w-full">
                <span className="username font-semibold cursor-pointer">{user.username}</span>
                <button className="cursor-pointer" onClick={handleChatClick}><AiFillMessage /></button>
            </div>
        </div>
    );
}