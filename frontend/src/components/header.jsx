import React from 'react'
import './header.css'
import { useNavigate } from "react-router-dom";

function Button() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/service");
  };

  return (
    <button onClick={handleClick}>
      Discover our services →
    </button>
  );
}

const Header = () => {
  return (
    <div className='header'>
        <div className='header-div'>
            <h2>LocalConnect</h2>
            <h3>Browse. Book. Done.</h3>
            <p>LocalConnect helps you discover local vendors and services with ease. Bookmark favorites, view locations, and contact providers directly through our platform.</p>
        </div>
        <div className='testimonial'>
            <div>
                “I needed a handyman on short notice and found three nearby options within minutes. Lifesaver.” 
– Sarah K. 
            </div>
            <div>
                “Great interface and fast results. I booked a photographer for our office event in less than an hour.”
– Jonathan M.
            </div>
            <div>
                “Clear layout and accurate info. The map view helped me pick a service within walking distance.” – Ben C.
            </div>
        </div>
        <Button />
    </div>
  )
}

export default Header