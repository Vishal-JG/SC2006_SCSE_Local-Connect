import React from "react";
//import axios from "axios"; 
import { useNavigate } from "react-router-dom";
import styles from "./MyListingsPage.module.css";

// Import reusable components
import BackButton from "../../components/BackButton";

// Import assets
import addIcon from '../../assets/basil_add-outline.svg';
import sample1 from '../../assets/sample1.png';
import sample2 from '../../assets/sample2.png';
import sample3 from '../../assets/sample3.png';

// DUMMY DATA - CONNECT TO BACKEND

const sampleListings = [
  {
    id: 1,
    name: "Elco Plumbing Co.",
    imageUrl: sample1,
  },
  {
    id: 2,
    name: "RapidFlow Plumbing Co.",
    imageUrl: sample2,
  },
  {
    id: 3,
    name: "QuickFix Solutions",
    imageUrl: sample3,
  },
];

const MyListingsPage = () => {
  const navigate = useNavigate(); // Uncomment

  const onAddNewServiceClick = () => {
  navigate("/ProviderUI/ServiceUploadPage"); 
  };

  const onViewEditClick = (service) => {
  navigate(`/ProviderUI/EditServicePage/${service.id}`, { state: { service } });
  };



  return (
    <div className={styles.myListingsPage}>

      {/* Back button + title */}
      <div className={styles.pageHeader}>
        <BackButton />
        <h2>My Listings</h2>
      </div>

      {/* Listing cards */}
      <div className={styles.listingsGrid}>
        {sampleListings.map((listing) => (
          <div key={listing.id} className={styles.listingCard}>
            <img
              src={listing.imageUrl}
              alt={listing.name}
              className={styles.listingImage}
            />
            <div className={styles.listingInfo}>
              <p className={styles.listingName}>{listing.name}</p>
              <button className={styles.viewEditButton} onClick={() => onViewEditClick(listing)}>
                View / Edit
              </button>
            </div>
          </div>
        ))}

        {/* Add new service button */}
        <div
          className={styles.addNewServiceCard}
          onClick={onAddNewServiceClick}
        >
          <img src={addIcon} alt="Add New Service" />
          <p>Add New Service</p>
        </div>
      </div>
    </div>
  );
};
  
export default MyListingsPage;