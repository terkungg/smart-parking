// ============================================
// SMART PARKING DASHBOARD
// Firebase Realtime Database REST API
// ============================================

// URL Firebase ของคุณ
const FIREBASE_URL =
  "https://smart-parking-iot-6467d-default-rtdb.asia-southeast1.firebasedatabase.app";


// ============================================
// เริ่มต้น
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  console.log("Smart Parking Dashboard เริ่มทำงาน");

  loadParkingData();

  // อัปเดตทุก 2 วินาที
  setInterval(loadParkingData, 2000);

});


// ============================================
// อ่านข้อมูล Firebase
// ============================================

async function loadParkingData() {

  try {

    const response = await fetch(
      FIREBASE_URL + "/parking.json?nocache=" + Date.now()
    );


    if (!response.ok) {

      throw new Error(
        "HTTP Error " + response.status
      );

    }


    const data =
      await response.json();


    console.log(
      "Firebase Data:",
      data
    );


    if (!data) {

      console.log(
        "ยังไม่มีข้อมูล Parking"
      );

      setOffline();

      return;

    }


    // ========================================
    // อัปเดตช่อง A1-A4
    // ========================================

    updateSlot(
      "A1",
      data.A1?.occupied === true
    );


    updateSlot(
      "A2",
      data.A2?.occupied === true
    );


    updateSlot(
      "A3",
      data.A3?.occupied === true
    );


    updateSlot(
      "A4",
      data.A4?.occupied === true
    );


    // ========================================
    // จำนวนช่อง
    // ========================================

    const total =
      Number(data.totalSlots || 4);


    const occupied =
      [
        data.A1?.occupied,
        data.A2?.occupied,
        data.A3?.occupied,
        data.A4?.occupied
      ]
      .filter(value => value === true)
      .length;


    const free =
      total - occupied;


    setText(
      "totalSlots",
      total
    );


    setText(
      "systemTotal",
      total
    );


    setText(
      "occupiedSlots",
      occupied
    );


    setText(
      "freeSlots",
      free
    );


    // ========================================
    // ESP8266 Status
    // ========================================

    const espOnline =
      data.online === true;


    const espStatus =
      document.getElementById(
        "espStatus"
      );


    if (espStatus) {

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

    }


    // ========================================
    // Firebase Status
    // ========================================

    const firebaseStatus =
      document.getElementById(
        "firebaseStatus"
      );


    if (firebaseStatus) {

      firebaseStatus.textContent =
        "ONLINE";

      firebaseStatus.style.color =
        "#16a34a";

    }


    // ========================================
    // Connection Status
    // ========================================

    const connection =
      document.getElementById(
        "connectionStatus"
      );


    if (connection) {

      connection.textContent =
        "● ONLINE";

      connection.className =
        "connection online";

    }


    // ========================================
    // เวลา
    // ========================================

    updateTime();


  }
  catch (error) {

    console.error(
      "Firebase Error:",
      error
    );


    setOffline();

  }

}


// ============================================
// อัปเดตช่องจอด
// ============================================

function updateSlot(
  name,
  occupied
) {

  const card =
    document.getElementById(
      "slot-" + name
    );


  if (!card) {

    console.error(
      "ไม่พบช่อง:",
      name
    );

    return;

  }


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


    if (status) {

      status.textContent =
        "🔴 มีรถ";

    }

  }
  else {

    card.classList.remove(
      "occupied"
    );

    card.classList.add(
      "free"
    );


    if (status) {

      status.textContent =
        "🟢 ว่าง";

    }

  }

}


// ============================================
// Offline
// ============================================

function setOffline() {

  const connection =
    document.getElementById(
      "connectionStatus"
    );


  if (connection) {

    connection.textContent =
      "● OFFLINE";

    connection.className =
      "connection offline";

  }


  const firebaseStatus =
    document.getElementById(
      "firebaseStatus"
    );


  if (firebaseStatus) {

    firebaseStatus.textContent =
      "OFFLINE";

    firebaseStatus.style.color =
      "#dc2626";

  }

}


// ============================================
// อัปเดตข้อความ
// ============================================

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);


  if (element) {

    element.textContent =
      value;

  }

}


// ============================================
// เวลา
// ============================================

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


  setText(
    "lastUpdate",
    "อัปเดตล่าสุด " + time
  );


  setText(
    "systemTime",
    time
  );

}
