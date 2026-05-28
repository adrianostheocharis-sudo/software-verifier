let provider;
let signer;
let contract;
let currentAccount;
let owner = null;
let ownerAddress;
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

  const addSection = document.getElementById("adminButtons");
  document.getElementById("connectWalletBtn").disabled = true;
  document.getElementById("verifyForm").style.display = "block";
  document.getElementById("getForm").style.display = "block";

  if (isOwner) {
    addSection.style.display = "block";
    document.getElementById("registerForm").style.display = "block";
  } else if(isPublisher){
    addSection.style.display = "none";
    document.getElementById("registerForm").style.display = "block";
  }else{
    addSection.style.display = "none";
  }

  const roleLabel = document.getElementById("roleLabel");

  if (isOwner) {
    roleLabel.innerText = "🟢 OWNER (Admin/Read/Write Mode)";
  } else if (isPublisher) {
    roleLabel.innerText = "🔵 PUBLISHER (Read/Write Mode)";
  } else {
    roleLabel.innerText = "⚪ CLIENT/AUDITOR (Read-only Mode)";
  }

}


async function addPublisherUI() {
  const addr = document.getElementById("walletInput").value;
  const el = document.getElementById("publisherResult");
  showLoader();
  if (!contract) {
    alert("❌ Connect MetaMask first!");
    return;
  }

  
  // ✅ CONFIRMATION
  const confirmAction = confirm(
    "Are you sure you want to ADD this publisher?\n\n" + addr
  );

  if (!confirmAction) return;


  // ✅ Validate address
  if (!isValidAddress(addr)) {
    el.style.color = "red";
    el.innerText = "❌ Invalid address!";
    return;
  }
  
  try {

    // ✅ Owner check (UI safety)
    const owner = await contract.owner();

    if (currentAccount.toLowerCase() !== owner.toLowerCase()) {
      el.style.color = "red";
      el.innerText = "❌ Only owner can add publishers!";
      hideLoader();
      return;
    }

    // ✅ Check if already publisher (UX)
    const exists = await contract.isPublisher(addr);

    if (exists) {
      el.style.color = "orange";
      el.innerText = "⚠️ Already a publisher!";
      hideLoader();
      return;
    }
    // ✅ Send transaction
    const tx = await contract.addPublisher(addr);
    await tx.wait();
    hideLoader();
    el.style.color = "#00ff99";
    el.innerText = "✅ Publisher added successfully!";

  } catch (err) {
    hideLoader();
    console.error(err);

    el.style.color = "red";

    if (err.reason) {

      el.innerText = "❌ " + err.reason;
    } else {
      el.innerText = "❌ Transaction failed!";
    }
  }
  checkPublisherStatus(addr);
}


async function removePublisherUI() {
  const addr = document.getElementById("walletInput").value;
  const el = document.getElementById("publisherResult");
  
  if (!contract) {
    alert("❌ Connect MetaMask first!");
    return;
  }

  // ✅ CONFIRMATION
  const confirmAction = confirm(
    "⚠️ WARNING!\n\nAre you sure you want to REMOVE this publisher?\n\n" + addr
  );

  if (!confirmAction) return;

  // ✅ Validate address
  if (!isValidAddress(addr)) {
    el.style.color = "red";
    el.innerText = "❌ Invalid address!";
    return;
  }

  try {
    // ✅ Owner check
    showLoader();
    const owner = await contract.owner();

    if (currentAccount.toLowerCase() !== owner.toLowerCase()) {
      el.style.color = "red";
      el.innerText = "❌ Only owner can remove publishers!";
      return;
    }

    // ✅ Check if exists
    const exists = await contract.isPublisher(addr);

    if (!exists) {
      el.style.color = "orange";
      el.innerText = "⚠️ Address is not a publisher!";
      return;
    }

    // ✅ Send transaction
    const tx = await contract.removePublisher(addr);
    await tx.wait();
    hideLoader();
    el.style.color = "#00ff99";
    el.innerText = "✅ Publisher removed successfully!";

  } catch (err) {
    console.error(err);
    hideLoader();
    el.style.color = "red";

    if (err.reason) {
      el.innerText = "❌ " + err.reason;
    } else {
      el.innerText = "❌ Transaction failed!";
    }
  }
  checkPublisherStatus(addr);
}


// ✅ Register
async function register() {

  if (isPublisher) {
    alert("❌ Only publisher can register release!");
    return;
  }

  if (!contract) {
    alert("Connect wallet first!");
    return;
  }

  showLoader();

  const version = document.getElementById("version").value;
  const hash = document.getElementById("hash").value;

  const tx = await contract.registerRelease(version, hash);

  await tx.wait();

  hideLoader();

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



