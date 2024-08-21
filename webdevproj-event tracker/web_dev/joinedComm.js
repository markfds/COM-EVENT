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
const database = getDatabase(app);
const auth = getAuth(app);

function displayJoinedCommunities(userId) {
    const communityRef = ref(database, 'Community');

    const communityContainer = document.getElementById('community-container');
    communityContainer.innerHTML = ''; 

    onValue(communityRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const communityData = childSnapshot.val();
            const communityId = childSnapshot.key;
            const communityName = communityData.name;
            const members = communityData.members;

            if (members && members[userId]) {
                const communityDiv = document.createElement('div');
                communityDiv.classList.add('community-item');

                const htmlContent = `
                    <h2>${communityName}</h2>
                    <p>Community ID: ${communityId}</p>
                    <h3>Members:</h3>
                    <ul>
                        ${Object.values(members).map(member => `<li>${member}</li>`).join('')}
                    </ul>
                     <button class="view-btn" data-community-id="${communityId}" data-community-name="${communityName}">View</button>
                `;

                communityDiv.innerHTML = htmlContent;
                communityContainer.appendChild(communityDiv);
            }
        });
    }, (error) => {
        console.error("Error fetching community data:", error);
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        displayJoinedCommunities(userId);
    } else {
        console.error('No user is currently authenticated');
    } 
});

document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('view-btn')) {
        const communityId = event.target.getAttribute('data-community-id');
        const communityName = event.target.getAttribute('data-community-name');
        window.location.href = `Comm.html?communityName=${encodeURIComponent(communityName)}`;
    }
});
document.getElementById('backbtn').addEventListener('click', function() {
    window.location.href = 'HomePage.html';
});
