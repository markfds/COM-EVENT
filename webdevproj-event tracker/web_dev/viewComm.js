import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js';
import { getDatabase, ref, onValue, set, get } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js';

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
const firestore = getFirestore(app);

const communityRef = ref(database, 'Community');

function displayCommunityData() {
    const communityContainer = document.getElementById('community-container');
    communityContainer.innerHTML = '';

    onValue(communityRef, (snapshot) => {
        communityContainer.innerHTML = ''; 
        snapshot.forEach((childSnapshot) => {
            const communityData = childSnapshot.val();
            const communityId = childSnapshot.key;
            const communityName = communityData.name;
            const members = communityData.members;

            const communityDiv = document.createElement('div');
            communityDiv.classList.add('community-item');

            const htmlContent = `
                <h2>${communityName}</h2>
                <p>Community ID: ${communityId}</p>
                <h3>Members:</h3>
                <ul>
                    ${members ? Object.values(members).map(member => `<li>${member}</li>`).join('') : '<li>No members registered</li>'}
                </ul>
                <button class="join-btn" data-community-id="${communityId}" data-community-name="${communityName}">Join</button>
            `;

            communityDiv.innerHTML = htmlContent;
            communityContainer.appendChild(communityDiv);
        });
    }, (error) => {
        console.error("Error fetching community data:", error);
    });
}

function registerForCommunity(communityId, communityName) {
    if (auth.currentUser !== null) {
        const userId = auth.currentUser.uid;
        const communityRef = ref(database, `Community/${communityId}/members/${userId}`);
        const userRef = doc(firestore, 'users', userId);

        getDoc(userRef).then((userDoc) => {
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData && userData.username) {
                    set(communityRef, userData.username)
                        .then(() => {
                            console.log("User registration successful!");
                            window.location.href = `Comm.html?communityName=${encodeURIComponent(communityName)}`;
                        })
                        .catch((error) => {
                            console.error("Error registering user for community:", error);
                        });
                } else {
                    console.log("Username not found in user data:", userData);
                }
            } else {
                console.log("No such document for user ID:", userId);
            }
        }).catch((error) => {
            console.error("Error fetching user data:", error);
        });
    } else {
        console.error('No user is currently authenticated');
    }
}

displayCommunityData();

document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('join-btn')) {
        const communityId = event.target.getAttribute('data-community-id');
        const communityName = event.target.getAttribute('data-community-name');
        registerForCommunity(communityId, communityName);
    } 
});

document.getElementById('backbtn').addEventListener('click', function() {
    console.log('clicked');
    
    window.location.href = 'HomePage.html';
});
