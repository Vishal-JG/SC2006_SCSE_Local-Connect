import React from 'react';
import './ServiceUI.css';
import arrow from '../../../assets/arrow_back.png'
import serviceImages from '../../../assets/services';
import SearchBar from '../../../components/SearchBar';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUtensils, 
  faTruckFast, 
  faBolt, 
  faBroom, 
  faWrench, 
  faScrewdriverWrench, 
  faScissors, 
  faLaptop, 
  faBookOpen, 
  faFaucet 
} from '@fortawesome/free-solid-svg-icons';

// Professional Font Awesome icon mapping for each service
const serviceIconsFA = {
  'Personal Chef': faUtensils,
  'Package Delivery': faTruckFast,
  'Electrician Services': faBolt,
  'Home Cleaning': faBroom,
  'Auto Mechanic': faWrench,
  'Handyman Repairs': faScrewdriverWrench,
  'Beauty Salon': faScissors,
  'Tech Support': faLaptop,
  'Private Tutoring': faBookOpen,
  'Plumbing Services': faFaucet
};

const ServiceUI = () => {
  const navigate = useNavigate();

  const handleServiceClick = (type) => {
    navigate(`/service/${type}`);
  };

  return (
    <>
      <div className='services-list' id="services-list">
        <div className='top'>
          <div className="header-content">
            <h1>Discover Our Services</h1>
            <p className="header-subtitle">Find trusted professionals for all your needs</p>
          </div>
        </div>
        <div className="explore-services-list">
          {serviceImages.map((service, index) => (
            <div
              key={index}
              className='services-list-item'
              onClick={() => handleServiceClick(service.name.toLowerCase())}
              style={{ cursor: "pointer" }}
            >
              <div className="service-icon-wrapper">
                <FontAwesomeIcon 
                  icon={serviceIconsFA[service.name]} 
                  className="service-icon"
                />
              </div>
              <p className="service-name">{service.name}</p>
              <span className="service-arrow">→</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ServiceUI;
