export const siteConfig = {
    name: "My Admin",                     // Full business name
    user: "shadcn ui",                     // ya baad maan isa fix karna ha 
    shortName: "Company Name",                   // Short name (sidebar ke liye)
    description: "Professional admin dashboard",
    logo: "/logo.svg",                    // apna logo public folder mein daalo
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