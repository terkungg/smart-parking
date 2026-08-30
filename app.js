// ============================================
// SMART PARKING DASHBOARD
// Firebase Realtime Database REST API
// ============================================

// URL Firebase (ปรับ Path เป็น /.json เพื่อดึงข้อมูลตรงจาก Root)
const FIREBASE_URL =
  "https://smart-parking-iot-6467d-default-rtdb.asia-southeast1.firebasedatabase.app/parking";

// ระยะเวลา Timeout ของ ESP8266 (ถ้าส่งข้อมูลช้าเกิน 10 วินาที จะถือว่า Offline)
const ESP_TIMEOUT_MS = 10000;


// ============================================
// เริ่มต้นระบบ (Poller แบบ ป้องกัน Request ชนกัน)
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("Smart Parking Dashboard เริ่มทำงาน");
  startPolling();
});

async function startPolling() {
  await loadParkingData();
  // ใช้ setTimeout แทน setInterval เพื่อป้องกันการเกิด Request ค้างสะสม
  setTimeout(startPolling, 2000);
}


// ============================================
// อ่านข้อมูลจาก Firebase
// ============================================

async function loadParkingData() {
  try {
    // 🛠️ FIX 1: แก้ไข URL ดึงค่าจาก Root (/.json) แทน /parking.json
    const response = await fetch(
      `${FIREBASE_URL}/.json?nocache=${Date.now()}`
    );

    if (!response.ok) {
      throw new Error("HTTP Error " + response.status);
    }

    const data = await response.json();

    console.log("Firebase Data:", data);

    if (!data) {
      console.log("ยังไม่มีข้อมูลใน Firebase");
      setOffline();
      return;
    }

    // ========================================
    // อัปเดตช่อง A1-A4
    // ========================================
    updateSlot("A1", data.A1?.occupied === true);
    updateSlot("A2", data.A2?.occupied === true);
    updateSlot("A3", data.A3?.occupied === true);
    updateSlot("A4", data.A4?.occupied === true);

    // ========================================
    // คำนวณจำนวนช่องจอด
    // ========================================
    const total = Number(data.totalSlots || 4);
    const occupied = [
      data.A1?.occupied,
      data.A2?.occupied,
      data.A3?.occupied,
      data.A4?.occupied,
    ].filter((value) => value === true).length;

    const free = total - occupied;

    setText("totalSlots", total);
    setText("systemTotal", total);
    setText("occupiedSlots", occupied);
    setText("freeSlots", free);

    // ========================================
    // เช็คสถานะ ESP8266 (พร้อมระบบ Heartbeat/Timeout)
    // ========================================
    let espOnline = data.online === true;

    // 🛠️ FIX 2: เช็ค timestamp ล่าสุด ถ้าส่งมาเกิน 10 วินาที จะถือว่าเน็ตหลุด/ดับ
    if (data.lastSeen) {
      const isHeartbeatActive = Date.now() - data.lastSeen < ESP_TIMEOUT_MS;
      espOnline = espOnline && isHeartbeatActive;
    }

    const espStatus = document.getElementById("espStatus");
    if (espStatus) {
      if (espOnline) {
        espStatus.textContent = "ONLINE";
        espStatus.style.color = "#16a34a";
      } else {
        espStatus.textContent = "OFFLINE";
        espStatus.style.color = "#dc2626";
      }
    }

    // ========================================
    // สถานะ Firebase (เชื่อมต่อสำเร็จ)
    // ========================================
    const firebaseStatus = document.getElementById("firebaseStatus");
    if (firebaseStatus) {
      firebaseStatus.textContent = "ONLINE";
      firebaseStatus.style.color = "#16a34a";
    }

    // ========================================
    // แถบสถานะระบบหลัก (Header Status)
    // ========================================
    const connection = document.getElementById("connectionStatus");
    if (connection) {
      connection.textContent = espOnline ? "● ONLINE" : "● DEVICE OFFLINE";
      connection.className = espOnline ? "connection online" : "connection offline";
    }

    // ========================================
    // อัปเดตเวลาล่าสุด
    // ========================================
    updateTime();

  } catch (error) {
    console.error("Firebase Fetch Error:", error);
    setOffline();
  }
}


// ============================================
// อัปเดตการแสดงผลช่องจอด
// ============================================

function updateSlot(name, occupied) {
  const card = document.getElementById("slot-" + name);

  if (!card) {
    console.error("ไม่พบช่องจอด:", name);
    return;
  }

  const status = card.querySelector(".slot-status");

  if (occupied) {
    card.classList.remove("free");
    card.classList.add("occupied");
    if (status) {
      status.textContent = "🔴 มีรถ";
    }
  } else {
    card.classList.remove("occupied");
    card.classList.add("free");
    if (status) {
      status.textContent = "🟢 ว่าง";
    }
  }
}


// ============================================
// จัดการสถานะเมื่อเชื่อมต่อไม่ได้ (Offline)
// ============================================

function setOffline() {
  const connection = document.getElementById("connectionStatus");
  if (connection) {
    connection.textContent = "● OFFLINE";
    connection.className = "connection offline";
  }

  const firebaseStatus = document.getElementById("firebaseStatus");
  if (firebaseStatus) {
    firebaseStatus.textContent = "OFFLINE";
    firebaseStatus.style.color = "#dc2626";
  }

  const espStatus = document.getElementById("espStatus");
  if (espStatus) {
    espStatus.textContent = "OFFLINE";
    espStatus.style.color = "#dc2626";
  }
}


// ============================================
// ฟังก์ชันช่วยอัปเดตข้อความใน HTML
// ============================================

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}


// ============================================
// อัปเดตเวลาแสดงผล
// ============================================

function updateTime() {
  const now = new Date();
  const time = now.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  setText("lastUpdate", "อัปเดตล่าสุด " + time);
  setText("systemTime", time);
}
