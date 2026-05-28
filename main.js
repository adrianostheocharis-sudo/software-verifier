let provider;
let signer;
let contract;
let readContract;
let writeContract;
let currentAccount;
let owner = null;
let isOwner;
let isPublisher;

//const contractAddress = "0xcb9A0962b383C2b609933D07ee4Bb39414FB88D7";
const contractAddress = "0xA1A969Eb2695c19B4d47e198917C2e7a136F582D";


const abi = [
  "function registerRelease(string memory _version, bytes32 _hash)",
  "function getRelease(string memory _version) view returns (string memory, bytes32, uint256, address)",
  "function verifyRelease(string memory _version, bytes32 _hash) view returns (bool)",
  "function owner() view returns (address)",
  "function isPublisher(address _addr) view returns (bool)",
  "function addPublisher(address _addr)",
  "function removePublisher(address _addr)"
];


// ✅ MetaMask Connect
async function connectWallet() {
  try {
    showLoader();

    // ✅ σύνδεση MetaMask
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    signer = provider.getSigner();
    currentAccount = await signer.getAddress();

    // ✅ contract με signer (write + read)
    contract = new ethers.Contract(contractAddress, abi, signer);

    // ✅ πάρε δεδομένα από contract
    ownerAddress = await contract.owner();
    isPublisher = await contract.isPublisher(currentAccount);

    // ✅ υπολόγισε roles
    isOwner = currentAccount.toLowerCase() === ownerAddress.toLowerCase();

    // ✅ εμφάνιση account
    document.getElementById("account").innerText =
      "Connected: " + currentAccount;

    // ✅ ενημέρωση UI
    updateAccessUI();

    hideLoader();

  } catch (err) {
    console.error(err);
    alert("❌ Failed to connect wallet!");
    hideLoader();
  }
}


function updateAccessUI() {

  // 🔹 Register section
/*   const registerBtn = document.getElementById("registerBtn");

  if (isPublisher) {
    registerBtn.disabled = false;
  } else {
    registerBtn.disabled = true;
  }
 */
  // 🔹 Admin (add/remove publishers)
  const addSection = document.getElementById("adminButtons");
  const removeSection = document.getElementById("useAddressBtn");

  if (isOwner) {
    addSection.style.display = "block";
    removeSection.style.display = "none";
    document.getElementById("useAddressConnectBtn").style.display = "none";
  } else if(isPublisher){
    addSection.style.display = "none";
    removeSection.style.display = "none";
    document.getElementById("useAddressConnectBtn").style.display = "block";
  }else{
    addSection.style.display = "none";
    removeSection.style.display = "block";
    document.getElementById("useAddressConnectBtn").style.display = "none";
  }

  const roleLabel = document.getElementById("roleLabel");

  if (isOwner) {
    roleLabel.innerText = "🟢 OWNER";
  } else if (isPublisher) {
    roleLabel.innerText = "🔵 PUBLISHER";
  } else {
    roleLabel.innerText = "⚪ USER";
  }

}

// ✅ Manual wallet input (read-only mode)
async function setManualWallet() {
  signer = null;
  writeContract = null;
  currentAccount = document.getElementById("walletInput").value;

  // ✅ Δημιουργία provider (χωρίς signer)
  provider = new ethers.providers.Web3Provider(window.ethereum);

  // ✅ Δημιουργία contract READ-ONLY
  readContract = new ethers.Contract(contractAddress, abi, provider);
  let exists = await readContract.isPublisher(currentAccount);
  let usingStatus;

  if (exists) {
    usingStatus = "";
    enableRegister();
  }else{
    disableRegister();
    usingStatus = "(read-only)";
  }
  document.getElementById("account").innerText = "Using address "+usingStatus+": " + currentAccount;

}


async function addPublisherUI() {
  const addr = document.getElementById("walletInput").value;

  if (!isValidAddress(addr)) {
    alert("❌ Invalid address!");
    return;
  }

  if (!signer) {
    alert("❌ Connect MetaMask first!");
    return;
  }

  try {
    showLoader();

    const exists = await writeContract.isPublisher(addr);

    if (exists) {
      hideLoader();
      alert("⚠️ Address is already a publisher!");
      return;
    }

    const tx = await writeContract.addPublisher(addr);

    //updateLoader("🟠 Transaction submitted...");

    await tx.wait();

    hideLoader();
    alert("✅ Publisher added!");
    validateWallet();
  } catch (err) {
    hideLoader();
    console.error(err);

    if (err.reason) {
      alert("❌ " + err.reason);
    } else {
      alert("❌ Transaction failed!");
    }
  }
}

async function removePublisherUI() {
  const addr = document.getElementById("walletInput").value;

  if (!isValidAddress(addr)) {
    alert("❌ Invalid address!");
    return;
  }

  if (!signer) {
    alert("❌ Connect MetaMask first!");
    return;
  }

  try {
    showLoader();

    const exists = await writeContract.isPublisher(addr);

    if (!exists) {
      hideLoader();
      alert("⚠️ Address is not a publisher!");
      return;
    }

    const tx = await writeContract.removePublisher(addr);

    //updateLoader("🟠 Transaction submitted...");

    await tx.wait();

    hideLoader();
    alert("✅ Publisher removed!");
    validateWallet();
  } catch (err) {
    hideLoader();
    console.error(err);

    if (err.reason) {
      alert("❌ " + err.reason);
    } else {
      alert("❌ Transaction failed!");
    }
  }
}

// ✅ Register
async function register() {

  if (isPublisher) {
    alert("❌ Only publisher can register release!");
    return;
  }

  if (!writeContract) {
    alert("Connect wallet first!");
    return;
  }

  showLoader();

  const version = document.getElementById("version").value;
  const hash = document.getElementById("hash").value;

  const tx = await writeContract.registerRelease(version, hash);

  await tx.wait();

  hideLoader();

  alert("✅ Release Registered!");
}

// ✅ Verify
async function verify() {
  
  if (!readContract) {
    alert("Connect wallet first!");
    return;
  }
  const version = document.getElementById("v_version").value;
  const hash = document.getElementById("v_hash").value;
  const el = document.getElementById("verifyResult");

  try {
    const result = await readContract.verifyRelease(version, hash);

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
  
  if (!readContract) {
    alert("Connect wallet first!");
    return;
  }
  const version = document.getElementById("g_version").value;
  const el = document.getElementById("releaseInfo");

  try {
    const data = await readContract.getRelease(version);

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



