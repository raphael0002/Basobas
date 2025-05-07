/* eslint-disable no-unused-vars */
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Calendar,
  Wifi,
  AirVent,
  Tv,
  Car,
  Dumbbell,
  Dog,
  Camera,
  Users,
  ChevronLeft,
  Edit,
  Star,
  Share2,
  MoveRight,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import EmptyState from "@/components/EmptyState"
import { format } from "date-fns"
import { useProperty } from "@/hooks/useProperties"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useAuth } from "@/context/AuthContext"
import VisitStatusManager from "../../components/VisitStatusManager"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FavoriteButton } from "@/components/FavoriteButton"
import { ChatButton } from "@/components/ChatButton"
import { ChatWindow } from "@/components/ChatWindow"
import { useChatContext } from "@/context/ChatProvider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Facebook, Twitter, Mail, LinkIcon } from "lucide-react"

const PropertyDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [openCheckout, setOpenCheckout] = useState(false)
  const [openVisitDialog, setOpenVisitDialog] = useState(false)
  const { startConversation, setIsChatOpen } = useChatContext()
  const [error, setError] = useState(null)

  let { data: property, isLoading, isError } = useProperty(id)
  property = property?.property

  console.log("property", property)
  const isOwner = user && property && user._id === property.host._id

  // Booking form
  const bookingForm = useForm({
    defaultValues: {
      startDate: "",
      endDate: "",
    },
  })

  const onSubmitBooking = async (data) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/bookings/book",
        {
          propertyId: id,
          startDate: data.startDate,
          endDate: data.endDate,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      )

      const { paymentUrl, paymentData } = res.data

      // Create form for eSewa redirect
      const form = document.createElement("form")
      form.method = "POST"
      form.action = paymentUrl

      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = key
        input.value = value
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()

      setOpenCheckout(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to initiate booking")
    }
  }

  // Visit form
  const visitForm = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      date: "",
      message: "",
    },
  })

  const onSubmitVisit = async (data) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/visits/book",
        {
          propertyId: id,
          ...data,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      )

      toast.success(res.data.message)
      setOpenVisitDialog(false)
      visitForm.reset()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send visit request")
    }
  }
  // Start conversation with property owner
  const handleMessageOwner = async () => {
    if (!user) {
      setError("Please log in to message the owner")
      return
    }
    if (!property?.host?._id) {
      setError("No owner found for this property")
      return
    }
    if (property.host._id === user._id) {
      setError("You cannot message yourself")
      return
    }
    try {
      setError(null)
      console.log("Starting conversation with owner:", property.host._id)
      const conversation = await startConversation(property.host._id, id)
      console.log("Conversation created:", conversation)
      setIsChatOpen(true) // Open chat window
    } catch (err) {
      console.error("Failed to start conversation:", err)
      setError("Failed to start conversation")
    }
  }

  // Fix for default marker icons
  const DefaultIcon = L.icon({
    iconUrl: "/marker-icon.png",
    iconRetinaUrl: "/marker-icon-2x.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
  L.Marker.prototype.options.icon = DefaultIcon

  const nightMode = {
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attribution:
      '© <a href="https://stadiamaps.com/">Stadia Maps</a>, © <a href="https://openmaptiles.org/">OpenMapTiles</a> © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-[500px] w-full rounded-xl" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        title="Property not found"
        description="The property you're looking for doesn't exist or may have been removed."
      />
    )
  }

  if (!property) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header with back button */}
        <div className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <a href="/dashboard/my-properties" className="flex items-center gap-2">
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden md:block">Back to Properties</span>
            </a>
          </Button>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <ShareOptions property={property} />
              </DropdownMenuContent>
            </DropdownMenu>
            <FavoriteButton propertyId={property._id} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and basic info */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{property.title}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-muted-foreground">
                      {property.address.city}, {property.address.state}
                    </span>
                  </div>
                </div>

                {isOwner && (
                  <Button asChild variant="outline">
                    <a href={`/dashboard/edit/${property._id}`} className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </a>
                  </Button>
                )}
              </div>

              {/* Property badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {property.propertyType.toLowerCase()}
                </Badge>
                <Badge variant="secondary">{property.bhkConfiguration.bedrooms} BHK</Badge>
                {property.isExpired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : (
                  <Badge variant="success">Active</Badge>
                )}
                {property.isAvailable && <Badge variant="outline">Available Now</Badge>}
              </div>
            </div>

            {/* Image Carousel */}
            <div className="rounded-xl overflow-hidden">
              {property.images?.length > 0 ? (
                <Carousel className="relative group">
                  <CarouselContent>
                    {property.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-video rounded-xl overflow-hidden">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={`Property image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Carousel>
              ) : (
                <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
                  <Home className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Thumbnail grid */}
            {property.images?.length > 1 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-auto rounded-lg overflow-hidden">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`Property thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Property details sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column */}
              <div className="space-y-8">
                {/* Description */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">About this property</h2>
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">What this place offers</h2>
                  {property.amenities?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {property.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-3">
                          {amenity === "Wifi" && <Wifi className="h-5 w-5" />}
                          {amenity === "Air Conditioning" && <AirVent className="h-5 w-5" />}
                          {amenity === "TV" && <Tv className="h-5 w-5" />}
                          {amenity === "Parking" && <Car className="h-5 w-5" />}
                          {amenity === "Gym" && <Dumbbell className="h-5 w-5" />}
                          {amenity === "Pet-Friendly" && <Dog className="h-5 w-5" />}
                          {amenity === "Security" && <Camera className="h-5 w-5" />}
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No amenities listed for this property.</p>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-8">
                {/* Property specs */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Property details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Bed className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Bedrooms</p>
                        <p className="font-medium">{property.bhkConfiguration.bedrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Bath className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Bathrooms</p>
                        <p className="font-medium">{property.bhkConfiguration.bathrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Ruler className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Area</p>
                        <p className="font-medium">{property.builtUpArea} sq.ft</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Max Guests</p>
                        <p className="font-medium">{property.maxGuests}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* House Rules */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">House rules</h2>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Dog className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pets</p>
                        <p className="font-medium">{property.houseRules.petsAllowed ? "Allowed" : "Not Allowed"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <AirVent className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Smoking</p>
                        <p className="font-medium">{property.houseRules.smokingAllowed ? "Allowed" : "Not Allowed"}</p>
                      </div>
                    </div>
                    {property.houseRules.extraRules && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Additional Rules</p>
                        <p className="font-medium">{property.houseRules.extraRules}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Map section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Where you'll be</h2>
              <div className="aspect-video rounded-xl overflow-hidden z-0 relative">
                {typeof window !== "undefined" && (
                  <MapContainer
                    center={property.address.coordinates}
                    zoom={15}
                    scrollWheelZoom={false}
                    className="h-full w-full rounded-xl"
                  >
                    <TileLayer url={nightMode.url} attribution={nightMode.attribution} />
                    <Marker position={property.address.coordinates}>
                      <Popup>
                        <div className="space-y-1">
                          <p className="font-medium">{property.address.street}</p>
                          <p className="text-sm">
                            {property.address.city}, {property.address.state}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                )}
              </div>
              <div className="mt-2 sm:flex sm:justify-between sm:items-center">
                <div className="space-y-1">
                  <p className="font-medium">{property.address.street}</p>
                  <p className="text-muted-foreground">
                    {property.address.city}, {property.address.state} {property.address.postalCode}
                  </p>
                  {property.address.landmark && (
                    <p className="text-muted-foreground">Near {property.address.landmark}</p>
                  )}
                </div>

                <Button variant="outline" className="mt-3 sm:mt-0" asChild>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${property.address.coordinates.lat}&mlon=${property.address.coordinates.lng}#map=17/${property.address.coordinates.lat}/${property.address.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Open in OpenStreetMap
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar - Renting card */}
          <div className="space-y-6">
            <Card className="top-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-2xl font-bold">
                      NPR {property.pricePerMonth}
                      <span className="text-base font-normal text-muted-foreground"> / month</span>
                    </p>
                    {property.pricePerDay > 0 && (
                      <p className="text-sm text-muted-foreground">NPR {property.pricePerDay} / day</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span>4.8</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Check-in</p>
                    <p className="font-medium">{format(new Date(property.availableFrom), "MMM d, yyyy")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Minimum stay</p>
                    <p className="font-medium">
                      {property.minimumStayMonths} month
                      {property.minimumStayMonths > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="block space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rent</span>
                    <span>NPR {property.pricePerMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit</span>
                    <span>NPR {property.securityDeposit || "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>NPR 120</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cleaning fee</span>
                    <span>NPR 75</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>NPR {property.pricePerMonth + (property.securityDeposit || 0) + 120 + 75}</span>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Dialog open={openCheckout} onOpenChange={setOpenCheckout}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full" disabled={isOwner || !property.isAvailable}>
                      Rent this property
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[90vw] max-w-md sm:w-full md:max-w-xl lg:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Complete your Renting Process</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[56vh] md:h-[500px] pr-4">
                      <FormProvider {...bookingForm}>
                        <form
                          onSubmit={bookingForm.handleSubmit(onSubmitBooking)}
                          className="space-y-6 p-1 sm:p-2 md:p-4"
                        >
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-center lg:text-left">Your Property</h3>
                            <div className="grid grid-cols-2 gap-4 p-3 sm:p-4 bg-muted/5 rounded-lg">
                              <FormField
                                control={bookingForm.control}
                                name="startDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Check-in</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="date"
                                        min={new Date(property.availableFrom).toISOString().split("T")[0]}
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={bookingForm.control}
                                name="endDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Check-out</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Price details</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-sm sm:text-base">
                                  NPR {property.pricePerMonth} x {property.minimumStayMonths} months
                                </span>
                                <span className="text-sm sm:text-base">
                                  NPR {property.pricePerMonth * property.minimumStayMonths}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-sm sm:text-base">Security deposit</span>
                                <span className="text-sm sm:text-base">NPR {property.securityDeposit || "0"}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-sm sm:text-base">Service fee</span>
                                <span className="text-sm sm:text-base">NPR 120</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-sm sm:text-base">Cleaning fee</span>
                                <span className="text-sm sm:text-base">NPR 75</span>
                              </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between font-semibold text-base sm:text-lg">
                              <span>Total</span>
                              <span>
                                NPR{" "}
                                {property.pricePerMonth * property.minimumStayMonths +
                                  (property.securityDeposit || 0) +
                                  120 +
                                  75}
                              </span>
                            </div>
                          </div>

                          <Button type="submit" size="lg" className="w-full text-sm sm:text-base">
                            Proceed to Payment
                          </Button>
                        </form>
                      </FormProvider>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
                <Dialog open={openVisitDialog} onOpenChange={setOpenVisitDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="w-full" disabled={isOwner}>
                      Book a Visit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Schedule a Property Visit</DialogTitle>
                    </DialogHeader>
                    <FormProvider {...visitForm}>
                      <form onSubmit={visitForm.handleSubmit(onSubmitVisit)} className="space-y-4">
                        <FormField
                          control={visitForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={visitForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={visitForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Your phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={visitForm.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={visitForm.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Message</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Any special requests or questions" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setOpenVisitDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Submit Request</Button>
                        </div>
                      </form>
                    </FormProvider>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>

            {/* Host info */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">About the host</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden border border-border flex-shrink-0">
                    {property.host.profilePicture ? (
                      <img
                        src={property.host.profilePicture || "/placeholder.svg"}
                        alt={property.host.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-secondary/50 flex items-center justify-center">
                        <Users className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <p className="font-medium text-xl">{property.host.name}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                      <span>Host since {new Date(property.host.createdAt || Date.now()).getFullYear()}</span>
                    </div>
                    {/* <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-sm">
                      <Badge variant="outline" className="font-normal">
                        <Key className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    </div> */}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-medium">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {property.host.email && (
                      <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/30">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary"
                          >
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="truncate">{property.host.email}</p>
                        </div>
                      </div>
                    )}
                    {property.host.phone && (
                      <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/30">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p>{property.host.phone}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/30">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p>
                          {property.address.city}, {property.address.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/30">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Response Time</p>
                        <p>Usually within 24 hours</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">About</h3>
                  <p className="text-sm text-muted-foreground">
                    {property.host.bio ||
                      "Professional host dedicated to providing exceptional stays. Feel free to reach out with any questions about the property or neighborhood."}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-0">
                <Button className="w-full" onClick={handleMessageOwner}>
                  <span className="flex items-center gap-2">
                    Message Host
                    <MoveRight className="h-4 w-4" />
                  </span>
                </Button>
                {error && <p className="text-destructive text-sm">{error}</p>}
              </CardFooter>
            </Card>
            {isOwner && (
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Visit Requests</h2>
                <VisitStatusManager propertyId={id} />
              </div>
            )}
          </div>
        </div>
      </div>
      <ChatButton />
      <ChatWindow />
    </div>
  )
}

// Update the ShareOptions component to include more property details and improve social media sharing

const ShareOptions = ({ property }) => {
  const propertyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${property._id}`
      : `https://yourwebsite.com/${property._id}`

  // Create a more detailed share text with property information
  const shareText = `Check out this ${property.bhkConfiguration.bedrooms} BHK ${property.propertyType.toLowerCase()} in ${property.address.city}, ${property.address.state} for NPR ${property.pricePerMonth}/month`

  // Get the first property image URL for sharing (if available)
  const imageUrl = property.images && property.images.length > 0 ? property.images[0].url : null

  const handleCopyLink = () => {
    navigator.clipboard.writeText(propertyUrl).then(() => {
      toast.success("Property link has been copied to clipboard")
    })
  }

  const shareViaTwitter = () => {
    // Twitter/X sharing with more details
    const twitterUrl = new URL("https://twitter.com/intent/tweet")
    twitterUrl.searchParams.append("text", shareText)
    twitterUrl.searchParams.append("url", propertyUrl)
    twitterUrl.searchParams.append("hashtags", "RealEstate,Property")

    window.open(twitterUrl.toString(), "_blank", "width=600,height=400")
  }

  const shareViaEmail = () => {
    // More detailed email sharing
    const emailSubject = `Property Listing: ${property.title}`
    const emailBody = `
Check out this property I found:

${property.title}
${property.bhkConfiguration.bedrooms} BHK ${property.propertyType.toLowerCase()} in ${property.address.city}, ${property.address.state}
Price: NPR ${property.pricePerMonth}/month
Area: ${property.builtUpArea} sq.ft

${propertyUrl}
`
    window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`, "_blank")
  }

  // Try to use the Web Share API if available (for mobile devices)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: shareText,
          url: propertyUrl,
        })
        toast.success("Thanks for sharing!")
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      // Fallback to copy link if Web Share API is not available
      handleCopyLink()
    }
  }

  return (
    <>
      <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
        <LinkIcon className="h-4 w-4 mr-2" />
        Copy Link
      </DropdownMenuItem>
      <DropdownMenuItem onClick={shareViaTwitter} className="cursor-pointer">
        <Twitter className="h-4 w-4 mr-2" />
        Twitter
      </DropdownMenuItem>
      <DropdownMenuItem onClick={shareViaEmail} className="cursor-pointer">
        <Mail className="h-4 w-4 mr-2" />
        Email
      </DropdownMenuItem>
      {navigator.share && (
        <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
          <Share2 className="h-4 w-4 mr-2" />
          Share...
        </DropdownMenuItem>
      )}
    </>
  )
}

export default PropertyDetails
