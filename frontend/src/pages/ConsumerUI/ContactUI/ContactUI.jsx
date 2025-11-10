import React from 'react'
import "./ContactUI.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faEnvelope, faComments } from '@fortawesome/free-solid-svg-icons';
import { faTelegram } from '@fortawesome/free-brands-svg-icons';

const TELEGRAM_GROUP_URL = "https://t.me/+vxpCaTX3cP9hZWM1"
const EMAIL_ADDRESS = "support@localconnect.com"

const ContactUI = () => {
  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Get In Touch</h1>
        <p>Questions? We're here to help!</p>
      </div>

      <div className="contact-container">
        <div className="contact-cards">
          <a
            href={TELEGRAM_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card telegram-card"
            aria-label="Join our Telegram group"
          >
            <div className="card-icon">
              <FontAwesomeIcon icon={faTelegram} />
            </div>
            <h3>Telegram</h3>
            <p>Join our community</p>
          </a>

          <a
            href={`mailto:${EMAIL_ADDRESS}`}
            className="contact-card email-card"
            aria-label="Send us an email"
          >
            <div className="card-icon">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <h3>Email</h3>
            <p>support@localconnect.com</p>
          </a>
        </div>
      </div>
    </div>
  )
}

export default ContactUI
