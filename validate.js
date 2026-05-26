document.getElementById("walletInput").addEventListener("input", validateWallet);

document.getElementById("version").addEventListener("input", validateRegister);
document.getElementById("hash").addEventListener("input", validateRegister);

document.getElementById("v_version").addEventListener("input", validateVerify);
document.getElementById("v_hash").addEventListener("input", validateVerify);

document.getElementById("g_version").addEventListener("input", validateGet);

function disableRegister() {
  const container = document.querySelectorAll(".container")[1]; // register box
  container.style.display = "none";
}

function enableRegister() {
  const container = document.querySelectorAll(".container")[1];
  container.style.display = "block";
}


function validateWallet() {
  const address = document.getElementById("walletInput").value;
  const btn = document.getElementById("walletBtn");

  if (isValidAddress(address)) {
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
}

function validateRegister() {
  const version = document.getElementById("version").value;
  const hash = document.getElementById("hash").value;
  const btn = document.getElementById("registerBtn");

  if (isNotEmpty(version) && isValidHash(hash)) {
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
}


function validateVerify() {
  const version = document.getElementById("v_version").value;
  const hash = document.getElementById("v_hash").value;
  const btn = document.getElementById("verifyBtn");

  if (isNotEmpty(version) && isValidHash(hash)) {
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
}

function validateGet() {
  const version = document.getElementById("g_version").value;
  const btn = document.getElementById("getBtn");

  if (isNotEmpty(version)) {
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
}


function validateWallet() {
  const address = document.getElementById("walletInput").value;
  const btn = document.getElementById("walletBtn");
  const input = document.getElementById("walletInput");

  if (isValidAddress(address)) {
    btn.disabled = false;
    input.style.border = "2px solid #00ff99"; // πράσινο
  } else {
    btn.disabled = true;
    input.style.border = "2px solid red"; // κόκκινο
  }
}

function isValidHash(hash) {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

function isNotEmpty(value) {
  return value && value.trim() !== "";
}

function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

window.onload = () => {
  document.getElementById("walletBtn").disabled = true;
  document.getElementById("registerBtn").disabled = true;
  document.getElementById("verifyBtn").disabled = true;
  document.getElementById("getBtn").disabled = true;
};
