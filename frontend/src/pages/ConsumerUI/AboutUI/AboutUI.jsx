import React from 'react'
import "./AboutUI.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, 
  faEye, 
  faShieldAlt, 
  faUsers, 
  faMapMarkerAlt, 
  faStar 
} from '@fortawesome/free-solid-svg-icons';

const AboutUI = () => {
  return (
    <div className="about-page">

      {/* Main Content */}
      <div className="about-container">
        {/* Mission & Vision */}
        <section className="about-mission-vision">
          <div className="mission-vision-grid">
            <div className="mission-card">
              <div className="icon-wrapper mission-icon">
                <FontAwesomeIcon icon={faRocket} />
              </div>
              <h3>Our Mission</h3>
              <p>
                Empower communities by connecting people with trusted local service providers.
              </p>
            </div>
            <div className="mission-card">
              <div className="icon-wrapper vision-icon">
                <FontAwesomeIcon icon={faEye} />
              </div>
              <h3>Our Vision</h3>
              <p>
                Be the leading platform where communities and local businesses thrive together.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="about-values">
          <h2>What We Stand For</h2>
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h4>Trust & Safety</h4>
              <p>Verified providers for peace of mind</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h4>Community First</h4>
              <p>Building strong local connections</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              <h4>Local Focus</h4>
              <p>Supporting neighborhood businesses</p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <h4>Quality Service</h4>
              <p>Excellence in every connection</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="about-stats">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>10K+</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Providers</p>
            </div>
            <div className="stat-item">
              <h3>20+</h3>
              <p>Categories</p>
            </div>
            <div className="stat-item">
              <h3>4.8★</h3>
              <p>Avg Rating</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutUI
