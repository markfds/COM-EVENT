import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js';
import { getDatabase, ref, push, onValue, update, get, set } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js';

const map= L.map('view-map')
map.setView([15.4907,73.8295],11)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
L.Control.geocoder().addTo(map);

function onMapClick(e)
{
    console.log(e.latlng);
    var latlang =document.querySelector(".lat-long")
    latlang.value = e.latlng.lat + ", " + e.latlng.lng;
}
map.on('click',onMapClick);

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

const urlParams = new URLSearchParams(window.location.search);
const communityName = urlParams.get('communityName');
const CommunityEventDB = ref(database, `CommunityEvent/${communityName}`);


onValue(CommunityEventDB, (snapshot) => {
    snapshot.forEach((childSnapshot) => {
        const childData = childSnapshot.val();
        const coordinates = childData.Coordinates;
        const [lat, lng] = coordinates.split(',');
        const event = childData.Event;
        
        
       
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup('<h1>' + event + '</h1> <button class="register-btn" data-event-id="${eventId}">Register for Event</button>');
    });
});

document.getElementById('searchform').addEventListener('submit', search);

function search(e) {
  e.preventDefault();
  searchMarkers();
}


function searchMarkers() {
  var searchValue = document.querySelector(".search-box").value.toLowerCase();

  onValue(CommunityEventDB, function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
          var childData = childSnapshot.val();
          var event = childData.Event.toLowerCase(); 
          if (event.includes(searchValue)) {
              var coordinates = childData.Coordinates;
              var [lat, lng] = coordinates.split(',');
              var marker = L.marker([lat, lng]).addTo(map);
              marker.bindPopup('<h1>' + event + '</h1> <button class="register-btn" data-event-id="${eventId}">Register for Event</button>').openPopup();
          }
      });
  });
}

function registerForEvent(eventId) {
    if (auth.currentUser !== null) {
        const userId = auth.currentUser.uid;
        const eventRef = ref(database, `CommunityEvent/${communityName}/${eventId}`);
        const userRef = doc(firestore, 'users', userId); 

     
        getDoc(userRef).then((userDoc) => {
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData && userData.username) {
               
                    const newData = { userId: { username: userData.username } };

                    
                    get(eventRef).then((snapshot) => {
                        const eventData = snapshot.val();
                        if (eventData) {
                            newData.eventName = eventData.name;

                            
                            set(ref(database, `CommunityEvent/${communityName}/${eventId}/Users/${userId}`), userData.username)
                                .then(() => {
                                    console.log("User registration successful!");
                                })
                                .catch((error) => {
                                    console.error("Error registering user for event:", error);
                                });
                        } else {
                            console.error("Event data not found for event ID:", eventId);
                        }
                    }).catch((error) => {
                        console.error("Error fetching event data:", error);
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
document.addEventListener('click',  function(event) {
    console.log('in registerevent listener');
    if (event.target && event.target.classList.contains('register-btn')) {
       
        const eventId = event.target.getAttribute('data-event-id');
         registerForEvent(eventId); 
    }
});

function createMarkerPopup(eventId, event) {
    const popupContent = `
        <h1>${event}</h1>
        <button class="register-btn" data-event-id="${eventId}">Register for Event</button>
    `;
    return popupContent;
}

function fetchAndDisplayMarkers() {
    onValue(CommunityEventDB, function(snapshot) {
        map.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            var coordinates = childData.Coordinates;
            var [lat, lng] = coordinates.split(',');
            var event = childData.Event;
            var url = childData.URL;
            var eventId = childSnapshot.key;

            var marker = L.marker([lat, lng]).addTo(map);
            marker.bindPopup(createMarkerPopup(eventId, event, url));
        });
    }, function(error) {
        console.error("Error fetching marker data: ", error);
    });
}

fetchAndDisplayMarkers();
