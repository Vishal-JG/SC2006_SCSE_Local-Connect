import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AnalyticsPage.module.css";
import BackButton from "../../components/BackButton";
import axios from "axios";
import { auth } from "../../firebase"; 
import { getIdToken } from "firebase/auth";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { CheckCircle, Star, MessageCircle, BarChart2, Package } from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faStar, faComment, faCheckCircle, faBox } from "@fortawesome/free-solid-svg-icons";

const AnalyticsPage = () => {
  const [completedServices, setCompletedServices] = useState([]);
  const [averageRatings, setAverageRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) throw new Error("You must be logged in!");
        const idToken = await getIdToken(user);

        const bookingsRes = await axios.get(
          "http://localhost:5000/api/bookings?role=provider&status=completed",
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setCompletedServices(bookingsRes.data.bookings || []);

        const ratingsRes = await axios.get("http://localhost:5000/api/reviews/averages");
        const ratingsMap = {};
        (ratingsRes.data || []).forEach(item => {
          ratingsMap[item.listing_id] = {
            avg_rating: parseFloat(item.avg_rating),
            review_count: parseInt(item.review_count),
          };
        });
        setAverageRatings(ratingsMap);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalServicesCompleted = completedServices.length;

  const overallAverageRating = (() => {
    const ids = [...new Set(completedServices.map(s => s.listing_id))];
    const ratings = ids.map(id => averageRatings[id]).filter(r => r && r.avg_rating);
    if (!ratings.length) return 0;
    return (ratings.reduce((sum, r) => sum + r.avg_rating, 0) / ratings.length).toFixed(1);
  })();

  const totalReviews = Object.values(averageRatings).reduce((sum, r) => sum + (r.review_count || 0), 0);

  // Area chart for completed services trend (grouped by month)
  const chartData = (() => {
    const counts = {};
    completedServices.forEach(s => {
      const date = new Date(s.booking_date);
      const key = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      counts[key] = (counts[key] || 0) + 1;
    });
    
    // Sort by date order
    const sortedEntries = Object.entries(counts).sort((a, b) => {
      return new Date(a[0]) - new Date(b[0]);
    });
    
    return sortedEntries.map(([date, count]) => ({ date, count }));
  })();

  // Rating distribution - This should show distribution of review counts by star rating
  // For now we'll show the distribution of average ratings across services
  const ratingData = (() => {
    const dist = { 5:0, 4:0, 3:0, 2:0, 1:0 };
    Object.values(averageRatings).forEach(r => {
      if (r && r.avg_rating) {
        const rounded = Math.round(r.avg_rating);
        // Count each review separately, not just the service
        dist[rounded] = (dist[rounded] || 0) + (r.review_count || 0);
      }
    });
    return Object.entries(dist).map(([stars, count]) => ({ stars:`${stars}⭐`, count })).reverse();
  })();

  const COLORS = ['#FFD700','#FFA500','#87CEEB','#90EE90','#DDA0DD'];
  const onServiceClick = service => navigate(`/ProviderUI/CompletedServicePage/${service.listing_id}`, { state: { service } });

  if (loading) return <div className={styles.analyticsPage}>Loading...</div>;
  if (error) return <div className={styles.analyticsPage}>{error}</div>;

  return (
    <div className={styles.analyticsPage}>
      <div className={styles.pageHeader}>
        <BackButton to="/ProviderUI/ProviderDashboard" />
        <h2 className={styles.pageTitle}>
          <FontAwesomeIcon icon={faChartLine} /> Analytics Dashboard
        </h2>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Completed Services</p>
            <p className={styles.statValue}>{totalServicesCompleted}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faStar} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Average Rating</p>
            <p className={styles.statValue}>{overallAverageRating > 0 ? overallAverageRating : 'N/A'}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faComment} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Reviews</p>
            <p className={styles.statValue}>{totalReviews}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.chartsContainer}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <FontAwesomeIcon icon={faChartLine} /> Completed Services Trend
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FFA500" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff" 
                  style={{ fontSize: '14px', fontWeight: '700', fill: '#ffffff' }} 
                />
                <YAxis 
                  stroke="#ffffff" 
                  style={{ fontSize: '14px', fontWeight: '700', fill: '#ffffff' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor:'rgba(255, 255, 255, 0.98)', 
                    border:'2px solid #FFD700', 
                    borderRadius:'12px', 
                    color:'#2d3748',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    fontWeight: '700',
                    fontSize: '14px'
                  }} 
                />
                <Area type="monotone" dataKey="count" stroke="#FFD700" fill="url(#colorCount)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className={styles.noData}>No completed services yet</div>}
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <FontAwesomeIcon icon={faStar} /> Rating Distribution
          </h3>
          {ratingData.some(d => d.count>0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                <XAxis 
                  dataKey="stars" 
                  stroke="#ffffff" 
                  style={{ fontSize: '14px', fontWeight: '700', fill: '#ffffff' }} 
                />
                <YAxis 
                  stroke="#ffffff" 
                  style={{ fontSize: '14px', fontWeight: '700', fill: '#ffffff' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor:'rgba(255, 255, 255, 0.98)', 
                    border:'2px solid #FFD700', 
                    borderRadius:'12px', 
                    color:'#2d3748',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    fontWeight: '700',
                    fontSize: '14px'
                  }} 
                />
                <Bar dataKey="count" radius={[8,8,0,0]}>
                  {ratingData.map((entry,index)=><Cell key={index} fill={COLORS[index%COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className={styles.noData}>No ratings available yet</div>}
        </div>
      </div>

      {/* Recent Completed Services */}
      <div className={styles.completedServicesContainer}>
        <h3 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faBox} /> Recent Completed Services
        </h3>
        <div className={styles.completedServicesList}>
          {completedServices.length === 0 ? (
            <div className={styles.noServices}>
              <FontAwesomeIcon icon={faBox} className={styles.noServicesIcon} />
              <p>No completed services yet.</p>
              <p className={styles.noServicesSubtext}>Complete bookings to populate analytics!</p>
            </div>
          ) : (
            completedServices
              .sort((a,b)=>new Date(b.booking_date)-new Date(a.booking_date))
              .slice(0,10)
              .map(service=> {
                const rating = averageRatings[service.listing_id];
                return (
                  <div key={service.booking_id} className={styles.completedServiceCard} onClick={()=>onServiceClick(service)}>
                    <div className={styles.serviceCardHeader}>
                      <div className={styles.serviceIcon}>
                        <FontAwesomeIcon icon={faBox} />
                      </div>
                      <div className={styles.serviceInfo}>
                        <p className={styles.serviceName}>{service.title||"Service"}</p>
                        <p className={styles.bookingId}>Booking #{service.booking_id}</p>
                      </div>
                    </div>
                    <div className={styles.serviceCardFooter}>
                      <div className={styles.serviceDate}>📅 {new Date(service.booking_date).toLocaleDateString()}</div>
                      {rating && rating.avg_rating > 0 && (
                        <div className={styles.serviceRating}>
                          <span className={styles.ratingValue}>{rating.avg_rating.toFixed(1)}</span>
                          <span className={styles.ratingStar}>⭐</span>
                          <span className={styles.reviewCount}>({rating.review_count})</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
