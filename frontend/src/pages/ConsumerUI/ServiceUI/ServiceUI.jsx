import React from 'react';
import './ServiceUI.css';
import arrow from '../../../assets/arrow_back.png'
import serviceImages from '../../../assets/services';
import SearchBar from '../../../components/SearchBar';
import { useNavigate } from "react-router-dom";
import HomeButton from '../../../components/HomeButton';

const ServiceUI = () => {
  const navigate = useNavigate();

  const handleServiceClick = (type) => {
    navigate(`/service/${type}`);
  };

  return (
    <>
      <div className='services-list' id="services-list">
        <HomeButton />
        <div className='top'>
          <h1>Discover our services</h1>
        </div>
        <div className="explore-services-list">
          {serviceImages.map((service, index) => (
            <div
              key={index}
              className='services-list-item'
              onClick={() => handleServiceClick(service.name.toLowerCase())}
              style={{ cursor: "pointer" }}
            >
              <img src={service.src} alt={service.name} />
              <p>{service.name}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ServiceUI;
