import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Camera,
  Pencil,
  Check,
  Lock,
  Ticket,
  Trash2,
  ShieldAlert,
} from "lucide-react";

export const UserProfile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    reset: profileReset,
    watch: profileWatch,
    setValue: setProfileValue,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm();

  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    reset: passwordReset,
    watch: passwordWatch,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm();

  const formatAddress = (address) => {
    if (!address || typeof address !== "object") return "Address not available";
    const { street, city, state, country, postalCode } = address;
    const parts = [street, city, state, postalCode, country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Address not available";
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/bookings/my-bookings",
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setBookings(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      profileReset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        username: user.username || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
      });
      setProfilePicturePreview(user.profilePicture || "");
    }
    fetchBookings();
  }, [user, profileReset]);

  useEffect(() => {
    if (location.state?.fromBookingSuccess) {
      fetchBookings();
    }
  }, [location.state]);

  const handleVerifyEmail = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/user/send-verification",
        {
          email: user.email,
          phone: user.phone,
          verificationMethod: "email",
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        navigate(`/otp-verification/${user.email}/${user.phone}`, {
          state: {
            fromProfile: true,
            from: location,
          },
          replace: true,
        });
      } else {
        toast.error(response.data.message || "Verification failed");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send verification email"
      );
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      toast.error("Please select an image file (JPEG, PNG, GIF)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setProfilePicture(file);
    const reader = new FileReader();
    reader.onload = () => setProfilePicturePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const updateProfile = async (data) => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      formData.append("name", data.name || "");
      formData.append("phone", data.phone || "");
      if (data.bio) formData.append("bio", data.bio);
      if (data.username) formData.append("username", data.username);
      if (data.dateOfBirth) {
        formData.append(
          "dateOfBirth",
          data.dateOfBirth.toISOString().split("T")[0]
        );
      }
      if (profilePicture instanceof File) {
        formData.append("profile", profilePicture);
      }

      const response = await axios.put(
        "http://localhost:5000/api/v1/user/me/update",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser(response.data.user);
      setProfilePicturePreview(response.data.user.profilePicture);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Update error:", error.response?.data);
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data) => {
    try {
      setIsLoading(true);

      const payload = {
        currentPassword: data.currentPassword.trim(),
        newPassword: data.newPassword.trim(),
      };

      await axios.post(
        "http://localhost:5000/api/v1/user/me/change-password",
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Password changed successfully");
      passwordReset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error changing password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      await axios.delete("http://localhost:5000/api/v1/user/me/delete-user", {
        withCredentials: true,
      });

      toast.success("Account deleted successfully");
      logout();
      navigate("/");
    } catch (error) {
      const message = error.response?.data?.message || "Error deleting account";
      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const getBookingStatus = (status) => {
    switch (status) {
      case "confirmed":
        return { label: "Upcoming", color: "bg-emerald-100 text-emerald-800" };
      case "cancelled":
        return { label: "Cancelled", color: "bg-red-100 text-red-800" };
      case "pending":
        return { label: "Pending", color: "bg-amber-100 text-amber-800" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              Confirm Account Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your data will be permanently
              removed from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90 rounded-lg"
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-[#047cb4] data-[state=active]:text-white transition-colors duration-200"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-[#047cb4] data-[state=active]:text-white transition-colors duration-200"
          >
            Security
          </TabsTrigger>
          <TabsTrigger
            value="bookings"
            className="data-[state=active]:bg-[#047cb4] data-[state=active]:text-white transition-colors duration-200"
          >
            My Bookings
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="profile" className="space-y-6">
            <form onSubmit={handleProfileSubmit(updateProfile)}>
              <div className="flex flex-col md:flex-row gap-8 mb-8 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <Avatar className="h-26 w-26 border-radius-50% border-2 border-white shadow-md">
                      <AvatarImage
                        src={
                          profilePicturePreview ||
                          user?.profilePicture ||
                          "/default-image.svg"
                        }
                        alt={user?.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-medium rounded-xl">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="profilePicture"
                      className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-2 rounded-full border shadow-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      <input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureChange}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-600 dark:text-gray-300"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        className="mt-1 rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        {...profileRegister("name", {
                          required: "Full name is required",
                        })}
                        placeholder="Your name"
                      />
                      {profileErrors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {profileErrors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="username"
                        className="text-sm font-medium text-gray-600 dark:text-gray-300"
                      >
                        Username
                      </Label>
                      <div className="flex items-center mt-1">
                        <span className="text-gray-500 mr-2">@</span>
                        <Input
                          id="username"
                          className="flex-1 rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          {...profileRegister("username")}
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm mb-6">
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-gray-500" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="bio"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Bio
                    </Label>
                    <Input
                      id="bio"
                      {...profileRegister("bio")}
                      placeholder="Tell us about yourself"
                      className="rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="dateOfBirth"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Date of Birth
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        >
                          {profileWatch("dateOfBirth") ? (
                            format(profileWatch("dateOfBirth"), "PPP")
                          ) : (
                            <span>Select your date of birth</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl border border-gray-100 shadow-lg">
                        <Calendar
                          mode="single"
                          selected={profileWatch("dateOfBirth")}
                          onSelect={(date) =>
                            setProfileValue("dateOfBirth", date)
                          }
                          initialFocus
                          className="rounded-xl"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      {...profileRegister("email")}
                      placeholder="your@email.com"
                      disabled
                      className="rounded-lg bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-80"
                    />
                    {!user?.accountVerified && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={handleVerifyEmail}
                        disabled={isLoading}
                        className="p-0 h-auto text-sm text-blue-600 dark:text-blue-400"
                      >
                        Verify your email
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      {...profileRegister("phone", {
                        required: "Phone is required",
                      })}
                      placeholder="+1234567890"
                      className="rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                    {profileErrors.phone && (
                      <p className="text-sm text-red-500">
                        {profileErrors.phone.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end px-6 pb-6">
                  <Button
                    type="submit"
                    disabled={isProfileSubmitting || isLoading}
                    className="rounded-lg px-6"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Check className="w-5 h-5 text-gray-500" />
                  Account Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div>
                    <p className="font-medium">Email Verified</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  {user?.accountVerified ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                      Verified
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVerifyEmail}
                      disabled={isLoading}
                      className="rounded-lg"
                    >
                      Verify
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div>
                    <p className="font-medium">Phone Verified</p>
                    <p className="text-sm text-gray-500">{user?.phone}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="rounded-lg"
                  >
                    Verify
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-500" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <form onSubmit={handlePasswordSubmit(changePassword)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="currentPassword"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...passwordRegister("currentPassword", {
                        required: "Current password is required",
                      })}
                      className="rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-500">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="newPassword"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordRegister("newPassword", {
                        required: "New password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                        maxLength: {
                          value: 32,
                          message: "Password cannot exceed 32 characters",
                        },
                      })}
                      className="rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-500">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordRegister("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === passwordWatch("newPassword") ||
                          "Passwords don't match",
                      })}
                      className="rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end px-6 pb-6">
                  <br />
                  <br />
                  <br />
                  <Button
                    type="submit"
                    disabled={isPasswordSubmitting || isLoading}
                    className="rounded-lg px-6"
                  >
                    {isLoading ? "Updating..." : "Change Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="border-2 border-destructive/20 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2 text-destructive">
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
              </CardContent>
              <CardFooter className="flex justify-end px-6 pb-6">
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isLoading}
                  className="rounded-lg px-6"
                >
                  Delete Account
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-gray-500" />
                  My Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse text-gray-500">
                      Loading bookings...
                    </div>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Ticket className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      No bookings yet
                    </h3>
                    <p className="text-gray-500 mt-2">
                      Your upcoming bookings will appear here
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 rounded-lg"
                      onClick={() => navigate("/")}
                    >
                      Browse properties
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {bookings.map((booking) => {
                      const status = getBookingStatus(booking.status);
                      const primaryImage =
                        booking.property.images?.[0].url ||
                        "/placeholder-property.jpg";
                      return (
                        <div
                          key={booking._id}
                          className="flex flex-col sm:flex-row items-start bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                          <div className="relative w-full sm:w-48 h-48 sm:h-auto">
                            <img
                              src={primaryImage}
                              alt={`${booking.property.title} thumbnail`}
                              className="w-full h-full object-cover"
                            />
                            <span
                              className={`absolute top-3 right-3 ${status.color} text-xs font-medium px-3 py-1 rounded-full`}
                            >
                              {status.label}
                            </span>
                          </div>
                          <div className="flex-1 p-5">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg">
                                  {booking.property.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatAddress(booking.property.address)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Check-in
                                </p>
                                <p className="text-sm">
                                  {format(new Date(booking.startDate), "PPP")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Check-out
                                </p>
                                <p className="text-sm">
                                  {format(new Date(booking.endDate), "PPP")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Total Amount
                                </p>
                                <p className="text-sm font-medium">
                                  NPR {booking.totalAmount}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end mt-4">
                              <Button
                                variant="outline"
                                className="relative rounded-lg bg-primary text-white overflow-hidden transition-all duration-300 hover:bg-primary/80 hover:shadow-lg hover:text-white"
                                onClick={() =>
                                  navigate(`/${booking.property._id}`)
                                }
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default UserProfile;
