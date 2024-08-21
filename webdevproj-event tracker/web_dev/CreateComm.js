import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js';
import { getDatabase, ref, push } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js';

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

console.log("Firebase initialized successfully");

document.getElementById('community-form').addEventListener('submit', submitForm);

function submitForm(event) {
    console.log("Form submitted");
    event.preventDefault(); 
    const communityName = document.getElementById('community-name').value;

    console.log("Form values:", {
        communityName
    });

    const communityData = {
        name: communityName,
    };

    const communitiesRef = ref(database, `Community`);
    push(communitiesRef, communityData)
        .then(() => {
            console.log('Community created successfully!');
            alert('Community created successfully!');
            document.getElementById('community-form').reset();
        })
        .catch((error) => {
            console.error('Error writing new community to Firebase Database', error);
        });
}
