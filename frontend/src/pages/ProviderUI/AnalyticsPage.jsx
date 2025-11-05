import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AnalyticsPage.module.css";
import BackButton from "../../components/BackButton";
import axios from "axios";
import { auth } from "../../firebase"; 
import { getIdToken } from "firebase/auth";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { CheckCircle, Star, MessageCircle, BarChart2, Package } from 'lucide-react';

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
            avg_rating: item.avg_rating,
            review_count: item.review_count,
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

  // Rating distribution
  const ratingData = (() => {
    const dist = { 5:0, 4:0, 3:0, 2:0, 1:0 };
    Object.values(averageRatings).forEach(r => {
      const rounded = Math.round(r.avg_rating);
      dist[rounded] = (dist[rounded] || 0) + 1;
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
        <BackButton />
        <h2 className={styles.pageTitle}>📊 Analytics Dashboard</h2>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckCircle size={36} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Completed Services</p>
            <p className={styles.statValue}>{totalServicesCompleted}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Star size={36} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Average Rating</p>
            <p className={styles.statValue}>{overallAverageRating > 0 ? overallAverageRating : 'N/A'}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MessageCircle size={36} />
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
            <BarChart2 size={20} /> Completed Services Trend
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(199,191,214,0.2)" />
                <XAxis dataKey="date" stroke="#c7bfd6" />
                <YAxis stroke="#c7bfd6" />
                <Tooltip contentStyle={{ backgroundColor:'#21005d', border:'1px solid #c7bfd6', borderRadius:'8px', color:'#fff' }} />
                <Area type="monotone" dataKey="count" stroke="#FFD700" fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className={styles.noData}>No completed services yet</div>}
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <Star size={20} /> Rating Distribution
          </h3>
          {ratingData.some(d => d.count>0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(199,191,214,0.2)" />
                <XAxis dataKey="stars" stroke="#c7bfd6" />
                <YAxis stroke="#c7bfd6" />
                <Tooltip contentStyle={{ backgroundColor:'#21005d', border:'1px solid #c7bfd6', borderRadius:'8px', color:'#fff' }} />
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
        <h3 className={styles.sectionTitle}>📋 Recent Completed Services</h3>
        <div className={styles.completedServicesList}>
          {completedServices.length === 0 ? (
            <div className={styles.noServices}>
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
                        <Package size={28} />
                      </div>
                      <div className={styles.serviceInfo}>
                        <p className={styles.serviceName}>{service.title||"Service"}</p>
                        <p className={styles.bookingId}>Booking #{service.booking_id}</p>
                      </div>
                    </div>
                    <div className={styles.serviceCardFooter}>
                      <div className={styles.serviceDate}>📅 {new Date(service.booking_date).toLocaleDateString()}</div>
                      {rating && (
                        <div className={styles.serviceRating}>
                          <span className={styles.ratingValue}>{rating.avg_rating}</span>
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
