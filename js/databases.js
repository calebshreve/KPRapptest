// Song database
const songDatabase = [
    {
        songTitle: "Bohemian Rhapsody",
        artistName: "Queen",
        ISWC: "T-000.000.001-0",
        ISRC: "GBUM71029604",
        splitType: 1
    },
    {
        songTitle: "Hotel California",
        artistName: "Eagles",
        ISWC: "T-000.000.002-0",
        ISRC: "USRC17607839",
        splitType: 2
    },
    {
        songTitle: "Imagine",
        artistName: "John Lennon",
        ISWC: "T-000.000.003-0",
        ISRC: "USRC17607840",
        splitType: 3,
        additionalArtists: ["The Beatles"],
        additionalTitles: ["All You Need Is Love"],
        additionalISRCs: ["USRC17607843", "USRC17607844", "USRC17607845", "USRC17607846"]
    },
    {
        songTitle: "Stairway to Heaven",
        artistName: "Led Zeppelin",
        ISWC: "T-000.000.004-0",
        ISRC: "USRC17607841",
        splitType: 4
    },
    {
        songTitle: "Like a Rolling Stone",
        artistName: "Bob Dylan",
        ISWC: "T-000.000.005-0",
        ISRC: "USRC17607842",
        splitType: 5
    }
];

// Split database for detailed split information
const splitDatabase = [
    {
        splitType: 1,
        writerName: "Freddie Mercury",
        writerIPI: "00012345678",
        writerShare: 50,
        publisherName: "Mercury Music Ltd",
        publisherIPI: "00087654321",
        publisherShare: 50,
        writerName2: "Brian May",
        writerIPI2: "00012345679",
        writerShare2: 50,
        publisherName2: "May Music Ltd",
        publisherIPI2: "00087654322",
        publisherShare2: 50
    },
    {
        splitType: 2,
        writerName: "Don Henley",
        writerIPI: "00023456789",
        writerShare: 40,
        publisherName: "Eagles Music Co",
        publisherIPI: "00076543210",
        publisherShare: 40
    },
    {
        splitType: 3,
        writerName: "John Lennon",
        writerIPI: "00034567890",
        writerShare: 50,
        publisherName: "Lennon Music",
        publisherIPI: "00065432109",
        publisherShare: 50,
        writerName2: "Paul McCartney",
        writerIPI2: "00034567891",
        writerShare2: 50,
        publisherName2: "McCartney Music",
        publisherIPI2: "00065432110",
        publisherShare2: 50
    },
    {
        splitType: 4,
        writerName: "Jimmy Page",
        writerIPI: "00045678901",
        writerShare: 50,
        publisherName: "Superhype Music",
        publisherIPI: "00054321098",
        publisherShare: 50
    },
    {
        splitType: 5,
        writerName: "Bob Dylan",
        writerIPI: "00056789012",
        writerShare: 75,
        publisherName: "Dwarf Music",
        publisherIPI: "00043210987",
        publisherShare: 75
    }
];

// Export databases for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        songDatabase,
        splitDatabase
    };
} 