import {
  ScrollText,
  ShieldCheck,
  FileText,
  AlertCircle,
  Home,
  Wallet,
  Handshake,
  Mail,
  CalendarCheck,
  BadgeCheck,
  CircleDollarSign,
  RefreshCw,
  Scale,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 dark:from-primary/20 dark:via-transparent rounded-3xl -z-10" />
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium mx-auto backdrop-blur-sm border border-primary/20"
          >
            <ScrollText className="h-4 w-4 mr-2 text-primary" />
            Legal Documentation
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            Last updated:{" "}
            <span className="font-medium text-foreground">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <motion.section 
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto"
      >
        <div className="space-y-8">
          {/* Introduction */}
          <motion.div variants={fadeIn}>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <span>Introduction</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Welcome to <span className="font-medium text-primary">Basobas</span>! These Terms govern your use of our property rental platform. By accessing our service, you agree to be bound by these terms.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Responsibilities */}
          <motion.div variants={fadeIn}>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BadgeCheck className="h-5 w-5 text-primary" />
                  </div>
                  <span>User Responsibilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Must be at least 18 years old",
                    "Provide accurate and complete information",
                    "No fraudulent activities or misrepresentations",
                    "Respect other users' privacy and rights",
                    "Comply with all applicable laws",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Property Listings */}
          <motion.div variants={fadeIn}>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <span>Property Listings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Owners are responsible for listing accuracy. Tenants should conduct due diligence.
                </p>
                <div className="grid gap-4">
                  {[
                    "No false or misleading information",
                    "Photos must represent the property accurately",
                    "Pricing must include all mandatory fees",
                    "Availability must be current",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/10 rounded-lg border border-muted">
                      <ShieldCheck className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payments & Fees */}
          <motion.div variants={fadeIn}>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CircleDollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <span>Payments & Fees</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Secure payments processed through trusted partners.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border rounded-xl p-4 bg-gradient-to-br from-background to-muted/10 border-muted hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-medium">For Tenants</h4>
                    </div>
                    <ul className="space-y-2.5 text-muted-foreground">
                      {[
                        "Security deposit (refundable)",
                        "First month's rent",
                        "Service fee (NPR 120)",
                        "Cleaning fee (NPR 75)",
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border rounded-xl p-4 bg-gradient-to-br from-background to-muted/10 border-muted hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-medium">For Owners</h4>
                    </div>
                    <ul className="space-y-2.5 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm">Platform service charges may apply</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Other sections follow the same pattern */}
          {/* Cancellations & Refunds */}
          <motion.div variants={fadeIn}>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <RefreshCw className="h-5 w-5 text-primary" />
                  </div>
                  <span>Cancellations & Refunds</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Policies vary by property. Review before booking.
                </p>
                <div className="grid gap-3">
                  {[
                    "Tenant cancellations may incur fees",
                    "Owner cancellations may result in penalties",
                    "Refunds processed in 7-10 business days",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/10 rounded-lg border border-muted">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Dispute Resolution */}
          <motion.div variants={fadeIn}>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <span>Dispute Resolution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We provide mediation services. Both parties agree to attempt mediation first.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Changes to Terms */}
          <motion.div variants={fadeIn}>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                  </div>
                  <span>Changes to Terms</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We may update these Terms periodically. Continued use constitutes acceptance.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact */}
          <motion.div variants={fadeIn}>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-background/50 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <span>Contact Us</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Questions? Email our legal team at{" "}
                  <Link
                    to="mailto:legal@basobas.com"
                    className="text-primary hover:underline font-medium"
                  >
                    legal@basobas.com
                  </Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Acceptance Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-6">
            By using our platform, you agree to these Terms.
          </p>
          <Link to="/">
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-8 py-6 text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/30 transition-all"
            >
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default TermsAndConditions;