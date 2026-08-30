// =====================================================
// Firebase SDK
// =====================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


import {
  getDatabase,
  ref,
  onValue,
  onDisconnect,
  set,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnqD07-p3YMubsS62QVQJbuL1lWTrG6e0",
  authDomain: "smart-parking-iot-6467d.firebaseapp.com",
  databaseURL: "https://smart-parking-iot-6467d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-parking-iot-6467d",
  storageBucket: "smart-parking-iot-6467d.firebasestorage.app",
  messagingSenderId: "1091121278576",
  appId: "1:1091121278576:web:11e160f0ad037346a10eb5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// =====================================================
// Firebase Initialize
// =====================================================

const app =
  initializeApp(firebaseConfig);


const db =
  getDatabase(app);


// =====================================================
// References
// =====================================================

const parkingRef =
  ref(db, "parking");


// =====================================================
// Connection Monitor
// =====================================================

const connectedRef =
  ref(db, ".info/connected");


onValue(
  connectedRef,
  (snapshot) => {

    const connected =
      snapshot.val() === true;


    const status =
      document.getElementById(
        "connectionStatus"
      );


    const firebaseStatus =
      document.getElementById(
        "firebaseStatus"
      );


    if (connected) {

      status.textContent =
        "● ONLINE";

      status.className =
        "connection online";

      firebaseStatus.textContent =
        "ONLINE";

    }
    else {

      status.textContent =
        "● OFFLINE";

      status.className =
        "connection offline";

      firebaseStatus.textContent =
        "OFFLINE";

    }

  }
);


// =====================================================
// อ่านข้อมูล Parking แบบ Real-time
// =====================================================

onValue(

  parkingRef,

  (snapshot) => {

    const data =
      snapshot.val();


    if (!data) {

      console.log(
        "ยังไม่มีข้อมูลจาก ESP8266"
      );

      return;

    }


    // -------------------------------------------------
    // A1
    // -------------------------------------------------

    updateSlot(
      "A1",
      data.A1?.occupied === true
    );


    // -------------------------------------------------
    // A2
    // -------------------------------------------------

    updateSlot(
      "A2",
      data.A2?.occupied === true
    );


    // -------------------------------------------------
    // A3
    // -------------------------------------------------

    updateSlot(
      "A3",
      data.A3?.occupied === true
    );


    // -------------------------------------------------
    // A4
    // -------------------------------------------------

    updateSlot(
      "A4",
      data.A4?.occupied === true
    );


    // -------------------------------------------------
    // Total
    // -------------------------------------------------

    const total =
      Number(data.totalSlots || 4);


    document.getElementById(
      "totalSlots"
    ).textContent = total;


    document.getElementById(
      "systemTotal"
    ).textContent = total;


    // -------------------------------------------------
    // Count
    // -------------------------------------------------

    const slots = [

      data.A1?.occupied === true,

      data.A2?.occupied === true,

      data.A3?.occupied === true,

      data.A4?.occupied === true

    ];


    const occupied =
      slots.filter(Boolean).length;


    const free =
      total - occupied;


    document.getElementById(
      "occupiedSlots"
    ).textContent =
      occupied;


    document.getElementById(
      "freeSlots"
    ).textContent =
      free;


    // -------------------------------------------------
    // ESP Status
    // -------------------------------------------------

    const espOnline =
      data.online === true;


    const espStatus =
      document.getElementById(
        "espStatus"
      );


    if (espOnline) {

      espStatus.textContent =
        "ONLINE";

      espStatus.style.color =
        "#16a34a";

    }
    else {

      espStatus.textContent =
        "OFFLINE";

      espStatus.style.color =
        "#dc2626";

    }


    // -------------------------------------------------
    // Update Time
    // -------------------------------------------------

    updateTime();

  },

  (error) => {

    console.error(
      "Firebase error:",
      error
    );

    document.getElementById(
      "firebaseStatus"
    ).textContent =
      "ERROR";

  }

);


// =====================================================
// Update Slot
// =====================================================

function updateSlot(
  name,
  occupied
) {

  const card =
    document.getElementById(
      "slot-" + name
    );


  if (!card) return;


  const status =
    card.querySelector(
      ".slot-status"
    );


  if (occupied) {

    card.classList.remove(
      "free"
    );

    card.classList.add(
      "occupied"
    );


    status.textContent =
      "🔴 มีรถ";

  }
  else {

    card.classList.remove(
      "occupied"
    );

    card.classList.add(
      "free"
    );


    status.textContent =
      "🟢 ว่าง";

  }

}


// =====================================================
// เวลาอัปเดตหน้าเว็บ
// =====================================================

function updateTime() {

  const now =
    new Date();


  const time =
    now.toLocaleTimeString(
      "th-TH",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    );


  document.getElementById(
    "lastUpdate"
  ).textContent =
    "อัปเดตล่าสุด " + time;


  document.getElementById(
    "systemTime"
  ).textContent =
    time;

}