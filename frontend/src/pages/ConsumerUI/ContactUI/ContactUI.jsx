import React from 'react'
import "./ContactUI.css"

const TELEGRAM_GROUP_URL = "https://t.me/yourgroup"
const EMAIL_ADDRESS = "support@localconnect.com"
const ContactUI = () => {
  return (
    <div className="contactus-container">
      <h1>Contact Us</h1>
      <p>
        We're here to help! Reach out to us via Telegram or Email.
      </p>

      <div className="contact-options">
        <a
          href={TELEGRAM_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-btn telegram"
          aria-label="Join our Telegram group"
        >
          Connect on Telegram
        </a>

        <a
          href={`mailto:${EMAIL_ADDRESS}`}
          className="contact-btn email"
          aria-label="Send us an email"
        >
          Email Us
        </a>
      </div>
    </div>
  )
}

export default ContactUI
