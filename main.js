let provider;
let signer;
let contract;
let currentAccount;

// ✅ βάλε το address σου
const contractAddress = "0xcb9A0962b383C2b609933D07ee4Bb39414FB88D7";

const abi = [
  "function registerRelease(string memory _version, bytes32 _hash)",
  "function getRelease(string memory _version) view returns (string memory, bytes32, uint256, address)",
  "function verifyRelease(string memory _version, bytes32 _hash) view returns (bool)",
  "function owner() view returns (address)"
];


document.getElementById("version").addEventListener("input", validateRegister);
document.getElementById("hash").addEventListener("input", validateRegister);

document.getElementById("v_version").addEventListener("input", validateVerify);
document.getElementById("v_hash").addEventListener("input", validateVerify);

document.getElementById("g_version").addEventListener("input", validateGet);

// ✅ MetaMask Connect
async function connectWallet() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();

  currentAccount = await signer.getAddress();

  document.getElementById("account").innerText = "Connected: " + currentAccount;

  contract = new ethers.Contract(contractAddress, abi, signer);

  // ✅ ΠΑΡΕ OWNER
  const owner = await contract.owner();

  // ✅ Έλεγχος
  if (currentAccount.toLowerCase() !== owner.toLowerCase()) {
    disableRegister();
  } else {
    enableRegister();
  }
}


// ✅ Manual wallet input (read-only mode)
function setManualWallet() {
  currentAccount = document.getElementById("walletInput").value;

  document.getElementById("account").innerText =
    "Using address (read-only): " + currentAccount;

  // ✅ Δημιουργία provider (χωρίς signer)
  provider = new ethers.providers.Web3Provider(window.ethereum);

  // ✅ Δημιουργία contract READ-ONLY
  contract = new ethers.Contract(contractAddress, abi, provider);

  // ✅ always disable register
  disableRegister();

}


// ✅ Register
async function register() {
  if (!contract) {
    alert("Connect wallet first!");
    return;
  }

  const version = document.getElementById("version").value;
  const hash = document.getElementById("hash").value;

  const tx = await contract.registerRelease(version, hash);
  await tx.wait();

  alert("✅ Release Registered!");
}

// ✅ Verify
async function verify() {
  
  if (!contract) {
    alert("Connect wallet first!");
    return;
  }
  const version = document.getElementById("v_version").value;
  const hash = document.getElementById("v_hash").value;
  const el = document.getElementById("verifyResult");

  try {
    const result = await contract.verifyRelease(version, hash);

    if (result) {
      el.style.color = "#00ff99"; // ✅ πράσινο
      el.innerText = "✅ VALID RELEASE";
    } else {
      el.style.color = "orange"; // ⚠️ πορτοκαλί (υπάρχει αλλά δεν ταιριάζει)
      el.innerText = "❌ INVALID RELEASE";
    }

  } catch (err) {
    console.error(err);

    // ✅ αν δεν υπάρχει release
    if (err.reason && err.reason.includes("not found")) {
      el.style.color = "red";
      el.innerText = "❌ Release not found!";
    } else {
      el.style.color = "red";
      el.innerText = "❌ Verification error!";
    }
  }
}


// ✅ Get Release
async function getRelease() {
  
  if (!contract) {
    alert("Connect wallet first!");
    return;
  }
  const version = document.getElementById("g_version").value;
  const el = document.getElementById("releaseInfo");

  try {
    const data = await contract.getRelease(version);

    el.style.color = "#00ff99";
    el.innerText =
      "Version: " + data[0] + "\n" +
      "Hash: " + data[1] + "\n" +
      "Timestamp: " + new Date(data[2] * 1000) + "\n" +
      "Publisher: " + data[3];

  } catch (err) {
    console.error(err);

    // ✅ Αν το error είναι "Release not found"
    if (err.reason && err.reason.includes("not found")) {
      el.style.color = "red";
      el.innerText = "❌ Release not found!";
    } else {
      el.style.color = "red";
      el.innerText = "❌ Error fetching release!";
    }
  }
}

function disableRegister() {
  const container = document.querySelectorAll(".container")[1]; // register box
  container.style.display = "none";
}

function enableRegister() {
  const container = document.querySelectorAll(".container")[1];
  container.style.display = "block";
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


function isValidHash(hash) {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

function isNotEmpty(value) {
  return value && value.trim() !== "";
}


window.onload = () => {
  document.getElementById("registerBtn").disabled = true;
  document.getElementById("verifyBtn").disabled = true;
  document.getElementById("getBtn").disabled = true;
};

