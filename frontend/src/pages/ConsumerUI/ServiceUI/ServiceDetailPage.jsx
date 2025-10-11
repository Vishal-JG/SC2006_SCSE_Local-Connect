import React, {useState, useEffect} from 'react'
import { useParams } from 'react-router-dom'
import bookmark from '../../../assets/bookmark.png'
import './ServiceDetailPage.css'
import BackButton from '../../../components/BackButton';

const dummyServiceData = {
  plumbingservices: [
    {
      id: "1",
      name: "Elco Plumber Co.",
      rating: 4.8,
      description:
        "Elco Plumber Co. provides fast, reliable, and affordable plumbing solutions for homes and businesses. Our certified technicians handle leaks, installations, inspections, and emergencies.",
      price: "$50 - $60",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "2",
      name: "RapidFlow Plumbing Co.",
      rating: 4.7,
      description: "Serving your plumbing needs quickly and professionally.",
      price: "$60 - $80",
      image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=700&q=80"
    }
  ]
};

const ServiceDetailPage = () => {
    const {type, id} = useParams()
    //test with dummy data, ltr uncomment the state hook
    const normalizedType = type.toLowerCase().replace(/\s+/g, '');
    console.log(id)
    const service = (dummyServiceData[normalizedType] && dummyServiceData[normalizedType].find((svc) => svc.id === id)) || null
    // const [service, setService] = useState(null)
    
    //*Change Needed*//
    // useEffect(() => {
    //     //fetch from API
    //     fetch(`http://localhost:5000/api/services/${type}/${id}`)
    //     .then(res => res.json())
    //     .then(data => setService(data))
    //     .catch(() => setService(null))
    // }, [type, id])

    if (!service) return(
        <div className="service-detail-bg">
            <div className="service-detail-panel">Service not found.</div>
        </div>
    )

    return (
        <div className='service-detail-page'>
            <div className='service-banner' style={{ backgroundImage: `url(${service.image})` }}></div>
            <BackButton />
            <div className='service-detail-content'>
                <div className='title-row'>
                    <span className='service-title-pill'>{service.name}</span>
                    <span className='service-rating'>⭐ {service.rating}</span>
                    <button className='bookmark-btn'>
                        <img src={bookmark} alt="Bookmark" style={{ width: 24, height: 24 }} />
                    </button>
                </div>
            </div>

            <div className="divider" />
            <h3>Details</h3>
            <p className="service-desc">
                {service.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eget vestibulum orci. Donec est purus, tincidunt ac justo a, bibendum fermentum magna. Curabitur cursus nisl felis, et hendrerit velit porta ac."}
            </p>
            <div className="service-price">
                <b>Price range:</b> {service.price || '$50 - $60'}
            </div>

            <div className='actions-row'>
                <button className='location-btn'>📍 Location</button>
                <button className="info-btn">More info →</button>
            </div>
        </div>
    )
}

export default ServiceDetailPage
