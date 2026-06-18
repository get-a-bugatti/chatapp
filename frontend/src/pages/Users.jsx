import api from "../api/axios.js";
import { UserBox } from "../components";
import { useState, useEffect } from "react";


export default function Users() {

    const [searchInput, setSearchInput] = useState("");
    const [searchError, setSearchError] = useState(null);
    const [users, setUsers] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    

    async function handleSearch() {

        try {
            if (!searchInput.trim() || typeof searchInput !== "string") {
                setSearchError("Please enter a valid search query.");
                return;
            }
    
            const response = await api.post("/api/v1/users/search", { username: searchInput });
            if (!response.data.success) {
                setSearchError(response.data.message);
                return;
            }
            
            setUsers(response.data.data);
        } catch (error) {
            const message = error.response?.data?.message || error.message || "An unexpected error occurred.";
            setSearchError(message);
        }
    }

    useEffect(() => {
        
        async function fetchUsers() {           
            try {
                const response = await api.get("/api/v1/users/others");
    
                if (!response.data.success) {
                    throw new Error(response.data.message);
                }
    
                setUsers(response.data.data);
                setLoading(false);
            } catch (error) {
                const message = error.response?.data?.message || error.message || "An unexpected error occurred.";
                setError(message);
            }
        }

        fetchUsers();
    }, []);

    if (error) return <div className="error text-red-500">Error: {error}</div>
    if (loading) return <div className="loader text-gray-500">Loading...</div>

    return (
        <div className="userlist-container">
            <div className="search-container flex items-center mb-4 w-full">
                <input 
                    type="text"
                    placeholder="Search users"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="border border-white rounded-lg px-4 py-2  mr-4"
                />
                <button className="border border-white rounded-lg px-4 py-2 cursor-pointer" onClick={() => handleSearch()}>Search</button>
            </div>

            {
                searchError &&
                <div className="search-error text-red-500">{searchError}</div>
            }

            <div className="userlist-container">
                {
                    users.map(user => <UserBox key={user._id} user={user} className="mb-4" />)
                }
            </div>
        </div>
    );
}