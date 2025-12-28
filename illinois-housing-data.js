// Illinois Emergency Housing Resources - Complete Dataset
const illinoisHousingData = [
    {
        id: 1,
        name: "Pacific Garden Mission",
        location: "1458 S Canal St",
        city: "Chicago",
        state: "IL",
        zip: "60607",
        type: "shelter",
        availability: "immediate",
        capacity: 1200,
        currentOccupancy: 850,
        familySize: "1-6",
        amenities: ["wheelchair-accessible", "family-friendly", "pet-friendly"],
        phone: "(312) 492-9410",
        website: "https://www.pgm.org",
        description: "Chicago's oldest and largest emergency shelter providing 24/7 services including meals, medical care, and case management.",
        rating: 4.3,
        distance: 0.5,
        lastUpdated: "2024-01-15",
        hours: "24/7",
        services: ["Meals", "Medical Care", "Case Management", "Laundry", "Job Training"],
        reviews: [
            { rating: 4, comment: "Large facility with many resources, staff is professional", date: "2024-01-10" },
            { rating: 4, comment: "Good meals and clean facilities", date: "2024-01-08" }
        ]
    },
    {
        id: 2,
        name: "Catholic Charities Emergency Shelter",
        location: "721 N LaSalle St",
        city: "Chicago",
        state: "IL",
        zip: "60654",
        type: "shelter",
        availability: "immediate",
        capacity: 200,
        currentOccupancy: 145,
        familySize: "1-8",
        amenities: ["wheelchair-accessible", "family-friendly", "lgbtq-friendly"],
        phone: "(312) 655-7000",
        website: "https://www.catholiccharities.net",
        description: "Emergency shelter with specialized programs for families, veterans, and individuals with disabilities.",
        rating: 4.5,
        distance: 1.2,
        lastUpdated: "2024-01-14",
        hours: "24/7",
        services: ["Family Services", "Veteran Support", "Disability Services", "Counseling"],
        reviews: [
            { rating: 5, comment: "Excellent family services and support", date: "2024-01-12" },
            { rating: 4, comment: "Very helpful staff and clean facilities", date: "2024-01-09" }
        ]
    },
    {
        id: 3,
        name: "Housing Forward",
        location: "1851 S 9th Ave",
        city: "Maywood",
        state: "IL",
        zip: "60153",
        type: "rapid-rehousing",
        availability: "urgent",
        capacity: 50,
        currentOccupancy: 32,
        familySize: "1-4",
        amenities: ["wheelchair-accessible", "family-friendly"],
        phone: "(708) 338-1724",
        website: "https://www.housingforward.org",
        description: "Rapid re-housing and prevention services for families and individuals in suburban Cook County.",
        rating: 4.6,
        distance: 2.1,
        lastUpdated: "2024-01-13",
        hours: "8 AM - 5 PM",
        services: ["Rental Assistance", "Housing Search", "Financial Counseling", "Legal Aid"],
        reviews: [
            { rating: 5, comment: "Helped me find housing quickly in the suburbs", date: "2024-01-11" },
            { rating: 4, comment: "Great support for families", date: "2024-01-07" }
        ]
    },
    {
        id: 4,
        name: "Springfield YWCA Domestic Violence Shelter",
        location: "421 E Jackson St",
        city: "Springfield",
        state: "IL",
        zip: "62701",
        type: "shelter",
        availability: "immediate",
        capacity: 40,
        currentOccupancy: 28,
        familySize: "1-6",
        amenities: ["family-friendly", "wheelchair-accessible"],
        phone: "(217) 789-4620",
        website: "https://www.ywca.org/springfield",
        description: "Confidential emergency shelter for survivors of domestic violence with 24/7 crisis support.",
        rating: 4.9,
        distance: 3.5,
        lastUpdated: "2024-01-12",
        hours: "24/7",
        services: ["Crisis Counseling", "Legal Advocacy", "Safety Planning", "Support Groups"],
        reviews: [
            { rating: 5, comment: "Saved my life and my children's lives", date: "2024-01-14" },
            { rating: 5, comment: "Incredibly supportive and safe environment", date: "2024-01-13" }
        ]
    },
    {
        id: 5,
        name: "Rockford Rescue Mission",
        location: "715 W State St",
        city: "Rockford",
        state: "IL",
        zip: "61102",
        type: "shelter",
        availability: "immediate",
        capacity: 150,
        currentOccupancy: 120,
        familySize: "1-6",
        amenities: ["family-friendly", "pet-friendly"],
        phone: "(815) 965-5332",
        website: "https://www.rockfordrescuemission.org",
        description: "Emergency shelter with comprehensive services including meals, medical care, and addiction recovery programs.",
        rating: 4.4,
        distance: 4.2,
        lastUpdated: "2024-01-11",
        hours: "24/7",
        services: ["Meals", "Medical Care", "Addiction Recovery", "Job Training"],
        reviews: [
            { rating: 4, comment: "Good meals and clean facilities", date: "2024-01-10" },
            { rating: 5, comment: "Life-changing recovery program", date: "2024-01-08" }
        ]
    },
    {
        id: 6,
        name: "Hines VA Hospital Transitional Housing",
        location: "5000 S 5th Ave",
        city: "Hines",
        state: "IL",
        zip: "60141",
        type: "transitional",
        availability: "urgent",
        capacity: 25,
        currentOccupancy: 18,
        familySize: "1-4",
        amenities: ["wheelchair-accessible", "lgbtq-friendly"],
        phone: "(708) 202-8387",
        website: "https://www.va.gov/hines-health-care",
        description: "Transitional housing specifically for veterans with specialized VA support services and medical care.",
        rating: 4.7,
        distance: 5.1,
        lastUpdated: "2024-01-10",
        hours: "24/7",
        services: ["VA Benefits", "PTSD Counseling", "Medical Care", "Peer Support"],
        reviews: [
            { rating: 5, comment: "Excellent VA services and veteran support", date: "2024-01-12" },
            { rating: 4, comment: "Great medical care and counseling", date: "2024-01-09" }
        ]
    },
    {
        id: 7,
        name: "Covenant House Illinois",
        location: "2934 W Lake St",
        city: "Chicago",
        state: "IL",
        zip: "60612",
        type: "shelter",
        availability: "immediate",
        capacity: 30,
        currentOccupancy: 22,
        familySize: "1-2",
        amenities: ["lgbtq-friendly", "family-friendly"],
        phone: "(773) 227-0110",
        website: "https://www.covenanthouse.org/illinois",
        description: "Safe space for youth ages 18-24 experiencing homelessness with comprehensive support services.",
        rating: 4.6,
        distance: 1.8,
        lastUpdated: "2024-01-16",
        hours: "24/7",
        services: ["Youth Counseling", "Education Support", "Life Skills", "Job Training"],
        reviews: [
            { rating: 5, comment: "Life-changing support for young people", date: "2024-01-15" },
            { rating: 4, comment: "Excellent staff and programs", date: "2024-01-13" }
        ]
    },
    {
        id: 8,
        name: "Peoria Rescue Mission",
        location: "601 SW Adams St",
        city: "Peoria",
        state: "IL",
        zip: "61602",
        type: "shelter",
        availability: "immediate",
        capacity: 80,
        currentOccupancy: 65,
        familySize: "1-5",
        amenities: ["family-friendly", "wheelchair-accessible"],
        phone: "(309) 676-6416",
        website: "https://www.peoriarescuemission.org",
        description: "Emergency shelter providing meals, medical care, and comprehensive support services for individuals and families.",
        rating: 4.5,
        distance: 0.5,
        lastUpdated: "2024-01-16",
        hours: "24/7",
        services: ["Meals", "Medical Care", "Case Management", "Addiction Recovery"],
        reviews: [
            { rating: 5, comment: "Compassionate staff and excellent services", date: "2024-01-14" },
            { rating: 4, comment: "Clean facilities and good meals", date: "2024-01-12" }
        ]
    },
    {
        id: 9,
        name: "Aurora Interfaith Food Pantry & Emergency Services",
        location: "1110 Jericho Rd",
        city: "Aurora",
        state: "IL",
        zip: "60506",
        type: "shelter",
        availability: "urgent",
        capacity: 45,
        currentOccupancy: 35,
        familySize: "1-4",
        amenities: ["family-friendly", "wheelchair-accessible"],
        phone: "(630) 897-2127",
        website: "https://www.aurorafoodpantry.org",
        description: "Emergency shelter with food pantry services and comprehensive support for families in crisis.",
        rating: 4.3,
        distance: 2.8,
        lastUpdated: "2024-01-15",
        hours: "8 AM - 8 PM",
        services: ["Food Pantry", "Emergency Shelter", "Case Management", "Financial Assistance"],
        reviews: [
            { rating: 4, comment: "Great food pantry and emergency services", date: "2024-01-13" },
            { rating: 4, comment: "Helpful staff and good resources", date: "2024-01-11" }
        ]
    },
    {
        id: 10,
        name: "Decatur Salvation Army Emergency Shelter",
        location: "229 W Main St",
        city: "Decatur",
        state: "IL",
        zip: "62523",
        type: "shelter",
        availability: "immediate",
        capacity: 60,
        currentOccupancy: 45,
        familySize: "1-6",
        amenities: ["family-friendly", "wheelchair-accessible"],
        phone: "(217) 428-4672",
        website: "https://www.salvationarmyusa.org",
        description: "Emergency shelter providing meals, case management, and comprehensive support services.",
        rating: 4.2,
        distance: 3.2,
        lastUpdated: "2024-01-14",
        hours: "24/7",
        services: ["Meals", "Case Management", "Spiritual Support", "Job Training"],
        reviews: [
            { rating: 4, comment: "Good meals and supportive environment", date: "2024-01-12" },
            { rating: 4, comment: "Helpful staff and clean facilities", date: "2024-01-10" }
        ]
    }
];

// Illinois-specific emergency resources
const illinoisEmergencyResources = {
    "211": {
        name: "211 Illinois",
        phone: "211",
        description: "Comprehensive service connecting residents to health and human services",
        website: "https://211illinois.org"
    },
    "crisis": {
        name: "Illinois Crisis Line",
        phone: "988",
        description: "24/7 mental health crisis support",
        website: "https://www.illinois.gov"
    },
    "domesticViolence": {
        name: "Illinois Domestic Violence Hotline",
        phone: "1-877-863-6338",
        description: "24/7 confidential support for domestic violence survivors",
        website: "https://www.illinois.gov"
    },
    "housing": {
        name: "Illinois Housing Development Authority",
        phone: "(312) 836-5200",
        description: "Rental assistance and affordable housing resources",
        website: "https://www.ihda.org"
    }
};

// Illinois cities for location suggestions
const illinoisCities = [
    "Chicago", "Aurora", "Rockford", "Joliet", "Naperville", "Springfield", 
    "Peoria", "Elgin", "Waukegan", "Cicero", "Champaign", "Bloomington",
    "Arlington Heights", "Evanston", "Decatur", "Schaumburg", "Bolingbrook",
    "Palatine", "Skokie", "Des Plaines", "Orland Park", "Tinley Park",
    "Oak Lawn", "Berwyn", "Mount Prospect", "Normal", "Wheaton", "Hoffman Estates",
    "Oak Park", "Downers Grove", "Elmhurst", "Glenview", "Lombard", "Buffalo Grove",
    "Bartlett", "Urbana", "Quincy", "Crystal Lake", "Streamwood", "Carol Stream",
    "Romeoville", "Plainfield", "Hanover Park", "Carpentersville", "Wheeling",
    "Park Ridge", "Addison", "Calumet City", "Northbrook", "St. Charles"
];

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        illinoisHousingData,
        illinoisEmergencyResources,
        illinoisCities
    };
}

