import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: 'yourAPIkey',
    authDomain: "yourAuthDomain",
    databaseURL: "yourDBURL",
    projectId: "yourProjectID",
    storageBucket: "yourStorageBucketURL",
    messagingSenderId: "yourmessagingSenderId",
    appId: "yourAppID",
    measurementId: "yourmeasurementId"
};

const app = initializeApp(firebaseConfig);
const database=getDatabase(app);
const auth = getAuth(app);
const urlParams = new URLSearchParams(window.location.search);
const communityName = urlParams.get('communityName');
const CommunityEventDB = ref(database, `CommunityEvent/${communityName}`);
function displayEventData(userId) {
    const eventContainer = document.getElementById('event-container');
    eventContainer.innerHTML = '';

    onValue(CommunityEventDB, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const eventData = childSnapshot.val();
            const eventId = childSnapshot.key;
            const event = eventData.Event;
            const coordinates = eventData.Coordinates;
            const users = eventData.Users;

            if (users && users[userId]) {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event-item');
    
                const htmlContent = `
                <h2>${event}</h2>
                <p>Event ID: ${eventId}</p>
                <p>Coordinates: ${coordinates}</p>
                <h3>Registered Users:</h3>
                <ul>
                    ${users ? Object.values(users).map(username => `<li>${username}</li>`).join('') : ''}
                </ul>
            `;
    
                eventDiv.innerHTML = htmlContent;
                eventContainer.appendChild(eventDiv);
            }

        });
    }, (error) => {
        console.error("Error fetching event data:", error);
    });
}

displayEventData();

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        displayEventData(userId);
    } else {
        console.error('No user is currently authenticated');
    }
});

document.getElementById("backbtn").addEventListener('click',()=>{
    window.location.href='Comm.js';
    const urlParams = new URLSearchParams(window.location.search);
    const communityName = urlParams.get('communityName');
    if (communityName) {
        window.location.href = `Comm.html?communityName=${communityName}`;
    }
})