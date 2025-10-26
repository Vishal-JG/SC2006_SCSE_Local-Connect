import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <main className="landing-root">
      {/* Hero Section */}
      <section id="hero" className="hero-bg">
        <div className="hero-content">
          <h1 className="hero-title">
            Find Services Near You In Seconds
          </h1>
          <p className="hero-subtitle">
            Our smart locator connects you with the best service providers in your area instantly.
          </p>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="services-section page-container">
        <h2>Popular Services</h2>
        <p className="section-description">
          Here are some of the most frequently requested services in your area
        </p>
        <div className="services-grid">
          <article className="service-card" tabIndex={0} role="link" aria-label="Internet Providers">
            <div className="service-icon-container primary-bg-opacity">
              <span role="img" aria-label="Internet" className="emoji-icon">📶</span>
            </div>
            <h3>Tech Support</h3>
            <p>Find the best deals for any tech related issue</p>
          </article>
          <article className="service-card" tabIndex={0} role="link" aria-label="Plumbers">
            <div className="service-icon-container secondary-bg-opacity">
              <span role="img" aria-label="Plumber" className="emoji-icon">💧</span>
            </div>
            <h3>Plumbers</h3>
            <p>Fix leaks and plumbing emergencies fast</p>
          </article>
          <article className="service-card" tabIndex={0} role="link" aria-label="Electricians">
            <div className="service-icon-container primary-bg-opacity">
              <span role="img" aria-label="Electrician" className="emoji-icon">🏠</span>
            </div>
            <h3>Electricians</h3>
            <p>Professional electrical services</p>
          </article>
          <article className="service-card" tabIndex={0} role="link" aria-label="Hair Salons">
            <div className="service-icon-container secondary-bg-opacity">
              <span role="img" aria-label="Salon" className="emoji-icon">✂️</span>
            </div>
            <h3>Hair Salons</h3>
            <p>Top-rated stylists near you</p>
          </article>
        </div>
        <div className="cta-container">
          <Link to="/service" className="cta-button-primary" role="button">
            Browse All Services <span aria-hidden="true" style={{fontSize: '1.25em'}}>→</span>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works page-container">
        <h2>How It Works</h2>
        <p className="section-description">
          Finding the right service provider has never been easier
        </p>
        <div className="how-it-works-grid">
          <div className="how-step">
            <div className="how-step-circle">1</div>
            <h3>Search</h3>
            <p>Enter the service you need and your location</p>
          </div>
          <div className="how-step">
            <div className="how-step-circle">2</div>
            <h3>Compare</h3>
            <p>Review ratings, prices, and availability</p>
          </div>
          <div className="how-step">
            <div className="how-step-circle">3</div>
            <h3>Connect</h3>
            <p>Book or contact the provider instantly</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section page-container">
        <h2>What Our Users Say</h2>
        <p className="section-description">
          Don't just take our word for it - hear from our happy customers
        </p>
        <div className="testimonials-grid">
          <article className="testimonial-card">
            <div className="testimonial-profile">
              <img src="http://static.photos/people/200x200/1" alt="Sarah Johnson" />
              <div>
                <h4>Sarah Johnson</h4>
                <div className="testimonial-stars" aria-label="5 stars rating">
                  {Array(5).fill(0).map((_, i) => <span key={i}>⭐</span>)}
                </div>
              </div>
            </div>
            <p>"Found a great plumber within minutes when our pipe burst at midnight. Lifesaver!"</p>
          </article>
          <article className="testimonial-card">
            <div className="testimonial-profile">
              <img src="http://static.photos/people/200x200/2" alt="Michael Chen" />
              <div>
                <h4>Michael Chen</h4>
                <div className="testimonial-stars" aria-label="5 stars rating">
                  {Array(5).fill(0).map((_, i) => <span key={i}>⭐</span>)}
                </div>
              </div>
            </div>
            <p>"Compared prices from 5 electricians and saved 30% on my rewiring job."</p>
          </article>
          <article className="testimonial-card">
            <div className="testimonial-profile">
              <img src="http://static.photos/people/200x200/3" alt="David Rodriguez" />
              <div>
                <h4>David Rodriguez</h4>
                <div className="testimonial-stars" aria-label="5 stars rating">
                  {Array(5).fill(0).map((_, i) => <span key={i}>⭐</span>)}
                </div>
              </div>
            </div>
            <p>"The hairdresser I found through LocatorLoom is now my regular stylist. Perfect match!"</p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
