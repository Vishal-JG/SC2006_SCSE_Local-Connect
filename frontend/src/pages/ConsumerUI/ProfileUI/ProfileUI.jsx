import React, { useEffect, useState } from 'react'
import "./ProfileUI.css"
import pic from "../../../assets/default-pic.png"
//Load Profile picture from database
//Able to change password from database
//Able to delete account 

const dummyUser = {
  name: "Alex Tan",
  email: "alex.tan@example.com",
  profilePicUrl: "https://randomuser.me/api/portraits/men/32.jpg"
};

const ProfileUI = () => {
    //state for user, need to change the dummyUser->null
    const [user, setUser] = useState(dummyUser)
    //state for loading status
    //const [loading, setLoading] = useState(true)
    
    const [selectedFile, setSelectedFile] = useState(null)
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]){
            const file = e.target.files[0]
            setSelectedFile(URL.createObjectURL(file))
            //need to upload to backend
        }
    }


    // useEffect(() => {
    //     // Need to replace API endpoint
    //     fetch('http://localhost:5000/api/users/me', {
    //     credentials: 'include', // If using cookies/session
    //     headers: {
    //         'Authorization': `Bearer ${localStorage.getItem('token')}`
    //     }
    //     })
    //     .then(res => res.json())
    //     .then(data => {
    //         setUser(data);
    //         setLoading(false);
    //     })
    //     .catch(() => setLoading(false));
    // }, []);
    // if (loading) return <div className='profile-container'>Loading...</div>
    // if (user) return <div className='profile-container'>Error loading profile...</div>
    return (
        <div className='profile-container'>
            <div className='profile-card'>
                <img className='profile-img' src={selectedFile || user.profilePicUrl ||  pic} alt="Profile" />
                <label htmlFor='upload-photo' className='upload-btn'>Upload Photo</label>
                <input 
                    type='file'
                    id='upload-photo'
                    accept='image/*'
                    onChange={handleFileChange}
                    style={{display: 'none'}}
                />
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                
                {/*Need to add backend endpoints */}
                <button className="profile-btn">Change Password</button>
                <button className="profile-btn delete">Delete Account</button>
            </div>
        </div>
    )
}

export default ProfileUI
