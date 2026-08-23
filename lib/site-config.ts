export const siteConfig = {
    name: "Company XYZ",                     // Full business name
    user: "shadcn ui", 
    userEmail: "shadcn@ui.com",
    userRole: "Admin",
    userAvatar: "/avatar.svg",
    shortName: "Company Name",                   // Short name (sidebar ke liye)
    description: "Professional admin dashboard",
    logo: "/favicon.ico",                    // apna logo public folder mein daalo
    favicon: "/favicon.ico",              // favicon path
    themeColor: "#4f46e5",                // primary color (browser UI ke liye)
    // Optional: social links, contact, etc.
    links: {
        twitter: "https://twitter.com/yourname",
        github: "https://github.com/yourname",
    },
    // Dashboard ke menu items bhi yahan centralize kar sakte ho
    navItems: [
        { title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
        { title: "Orders", url: "/orders", icon: "ShoppingCart" },
        { title: "Customers", url: "/customers", icon: "Users" },
        // ...
    ],
}