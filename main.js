let provider;
let signer;
let contract;
let currentAccount;

// ✅ βάλε το address σου
const contractAddress = "0xcb9A0962b383C2b609933D07ee4Bb39414FB88D7";

const abi = [
  "function registerRelease(string memory _version, bytes32 _hash)",
  "function getRelease(string memory _version) view returns (string memory, bytes32, uint256, address)",
  "function verifyRelease(string memory _version, bytes32 _hash) view returns (bool)"
];

// ✅ MetaMask Connect
async function connectWallet() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();

  currentAccount = await signer.getAddress();
  document.getElementById("account").innerText = "Connected: " + currentAccount;

  contract = new ethers.Contract(contractAddress, abi, signer);
}

// ✅ Manual wallet input (read-only mode)
function setManualWallet() {
  currentAccount = document.getElementById("walletInput").value;

  document.getElementById("account").innerText =
    "Using address (read-only): " + currentAccount;
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
  const version = document.getElementById("v_version").value;
  const hash = document.getElementById("v_hash").value;

  const result = await contract.verifyRelease(version, hash);

  document.getElementById("verifyResult").innerText =
    result ? "✅ VALID RELEASE" : "❌ INVALID RELEASE";
}

// ✅ Get Release
async function getRelease() {
  try {
    const version = document.getElementById("g_version").value;

    const data = await contract.getRelease(version);
    console.log(data[2]);
    // ✅ CHECK αν υπάρχει
    if (data[2] == 0) {
      document.getElementById("releaseInfo").innerText =
        "❌ Release not found!";
      return;
    }

    document.getElementById("releaseInfo").innerText =
      "Version: " + data[0] + "\n" +
      "Hash: " + data[1] + "\n" +
      "Timestamp: " + new Date(data[2] * 1000) + "\n" +
      "Publisher: " + data[3];

  } catch (err) {
    console.error(err);

    document.getElementById("releaseInfo").innerText =
      "❌ Error retrieving release!";
  }
}
