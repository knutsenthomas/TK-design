export const menuList = [
    {
        id: 1,
        path: "/",
        name: "Home",
    },
    {
        id: 2,
        path: "/",
        section: "#about",
        name: "About",
    },
    {
        id: 3,
        path: "/",
        section: "#projects",
        name: "Work",
    },
    {
        id: 4,
        path: "/",
        section: "#services",
        name: "Services",
        dropDown: [
            {
                id: 1,
                path: "/all-services",
                name: "Services",
            },
            {
                id: 2,
                path: "/service-details",
                name: "Service Details",
            },
        ],
    },
    {
        id: 5,
        path: "/",
        section: "#testimonial",
        name: "Testimonial",
    },
    {
        id: 6,
        path: "/",
        section: "#blog",
        name: "Blog",
        dropDown: [
            {
                id: 1,
                path: "/all-blog",
                name: "Blog",
            },
            {
                id: 2,
                path: "/blog-details",
                name: "Blog Details",
            },
        ],
    },
    {
        id: 7,
        path: "/contact",
        name: "Contact",
    },
];