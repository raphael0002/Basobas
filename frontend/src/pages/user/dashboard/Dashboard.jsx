/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Calendar,
  Users,
  Clock,
  DollarSign,
  User,
  Settings,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, addMonths, endOfMonth } from "date-fns";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalPayments: 0,
    pendingPayments: 0,
    totalProperties: 0,
    rentedProperties: 0,
    availableProperties: 0,
    pendingApprovals: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const navigate = useNavigate();

  // Chart data
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);

  // Redirect to /auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setDataLoading(true);

      // Fetch data in parallel
      const [bookingsRes, paymentsRes, propertiesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/bookings/my-bookings", {
          withCredentials: true,
        }),
        axios.get("http://localhost:5000/api/payments/my-payments", {
          withCredentials: true,
        }),
        axios.get(`http://localhost:5000/api/properties/host/${user._id}`, {
          withCredentials: true,
        }),
      ]);

      // Process bookings
      const fetchedBookings = bookingsRes.data?.data || [];
      const currentDate = new Date();
      const activeBookings = fetchedBookings.filter(
        (booking) =>
          booking.status === "confirmed" &&
          new Date(booking.startDate) <= currentDate &&
          new Date(booking.endDate) >= currentDate
      );

      // Process payments
      const fetchedPayments = paymentsRes.data?.data || [];
      console.log(fetchedPayments);
      const totalPayments = fetchedPayments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );
      console.log(totalPayments);
      // Process properties
      const fetchedProperties = propertiesRes.data?.data || [];
      const propertyStats = {
        totalProperties: fetchedProperties.length,
        rentedProperties: fetchedProperties.filter((p) => !p.isAvailable)
          .length,
        availableProperties: fetchedProperties.filter((p) => p.isAvailable)
          .length,
        pendingApprovals: fetchedProperties.filter(
          (p) => p.approvalStatus === "active"
        ).length,
      };

      // Calculate revenue data
      const revenueData = [];
      for (let i = 5; i >= 0; i--) {
        const month = addMonths(new Date(), -i);
        const monthStart = format(month, "yyyy-MM-01");
        const monthEnd = format(endOfMonth(month), "yyyy-MM-dd");

        const monthPayments = fetchedPayments.filter((p) => {
          const paymentDate = new Date(p.paymentDate || p.createdAt);
          return (
            paymentDate >= new Date(monthStart) &&
            paymentDate <= new Date(monthEnd)
          );
        });

        const revenue = monthPayments.reduce(
          (sum, p) => sum + (p.amount || 0),
          0
        );

        revenueData.push({
          name: format(month, "MMM"),
          revenue,
        });
      }
      console.log(revenueData);
      // Calculate occupancy data
      const occupancyData = [];
      for (let i = 5; i >= 0; i--) {
        const month = addMonths(new Date(), -i);
        const monthStart = format(month, "yyyy-MM-01");
        const monthEnd = format(endOfMonth(month), "yyyy-MM-dd");

        const monthBookings = fetchedBookings.filter((booking) => {
          const bookingStart = new Date(booking.startDate);
          const bookingEnd = new Date(booking.endDate);
          return (
            bookingStart <= new Date(monthEnd) &&
            bookingEnd >= new Date(monthStart) &&
            booking.status === "confirmed"
          );
        });

        const rate =
          propertyStats.totalProperties > 0
            ? (monthBookings.length / propertyStats.totalProperties) * 100
            : 0;

        occupancyData.push({
          name: format(month, "MMM"),
          rate: Math.round(rate),
        });
      }

      // Update state
      setBookings(fetchedBookings);
      setPayments(fetchedPayments);
      setProperties(fetchedProperties);
      setStats({
        totalBookings: fetchedBookings.length,
        activeBookings: activeBookings.length,
        totalPayments,
        pendingPayments: fetchedPayments.filter((p) => p.status !== "completed")
          .length,

        ...propertyStats,
      });
      setRevenueData(revenueData);
      setOccupancyData(occupancyData);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch data");
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setDataLoading(false);
      console.log("Data fetched successfully", stats);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight">
            Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mt-1 sm:mt-2">
            Welcome back, {user?.name || "User"} 👋
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          <StatCard
            title="Total Properties"
            value={stats.totalProperties}
            icon={<Home className="h-4 w-4 sm:h-5 sm:w-5" />}
            trend={stats.totalProperties > 0 ? "up" : "neutral"}
          />
          <StatCard
            title="Rented Properties"
            value={stats.rentedProperties}
            icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}
            trend={stats.rentedProperties > 0 ? "up" : "neutral"}
          />
          <StatCard
            title="Monthly Revenue"
            value={`NPR ${stats.totalPayments.toLocaleString()}`}
            icon={<DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />}
            trend="neutral"
          />
          {/* <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<Clock className="h-4 w-4 sm:h-5 sm:w-5" />}
            trend="neutral"
          /> */}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`NPR ${value.toLocaleString()}`]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {dataLoading ? "Loading..." : "No revenue data available"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Occupancy Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Rate</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {occupancyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyData}>
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value) => [`${value}%`]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar dataKey="rate" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {dataLoading ? "Loading..." : "No occupancy data available"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Properties List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Properties</CardTitle>
            <CardDescription>
              {properties.length} properties listed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {properties.length > 0 ? (
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property._id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          property.images?.[0]?.url ||
                          "/placeholder-property.jpg"
                        }
                        alt={property.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{property.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {property.address?.city}, {property.address?.country}
                        </p>
                        <Badge
                          variant={
                            property.isAvailable ? "default" : "secondary"
                          }
                        >
                          {property.isAvailable ? "Available" : "Rented"}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/${property._id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {dataLoading
                    ? "Loading properties..."
                    : "No properties listed yet"}
                </p>
                <Button onClick={() => navigate("/properties/new")}>
                  Add Your First Property
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>{bookings.length} bookings total</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">
                          {booking.property?.title || "Unknown Property"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.startDate), "MMM dd, yyyy")}{" "}
                          - {format(new Date(booking.endDate), "MMM dd, yyyy")}
                        </p>
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {dataLoading ? "Loading bookings..." : "No bookings yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, trend, change }) => {
  console.log("StatCard props:", { title, value, icon, trend, change });
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 text-sm">
          {icon}
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end">
          <p className="text-2xl font-light">{value}</p>
          {trend && change && (
            <Badge
              variant={
                trend === "up"
                  ? "default"
                  : trend === "down"
                  ? "destructive"
                  : "secondary"
              }
              className="ml-2 mb-1 text-xs"
            >
              {trend === "up" ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : trend === "down" ? (
                <ArrowDown className="h-3 w-3 mr-1" />
              ) : null}
              {change}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
