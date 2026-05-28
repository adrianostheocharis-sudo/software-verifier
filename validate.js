document.getElementById("walletInput").addEventListener("input", validateWallet);

document.getElementById("version").addEventListener("input", validateRegister);
document.getElementById("hash").addEventListener("input", validateRegister);

document.getElementById("v_version").addEventListener("input", validateVerify);
document.getElementById("v_hash").addEventListener("input", validateVerify);

document.getElementById("g_version").addEventListener("input", validateGet);



let currentRole = null;

function setRole() {

  if (isOwner || isPublisher) {
    enableRegister();
      document.getElementById("account").innerText = "Using address: " + currentAccount;
  } else {
    disableRegister();
      document.getElementById("account").innerText = "Using address (read-only): " + currentAccount;
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


function validateWallet() {
  const input = document.getElementById("walletInput");
  let address = input.value;

  if (isValidAddress(address)) {

    address = ethers.utils.getAddress(address);
    input.style.border = "2px solid #00ff99";
    
    checkPublisherStatus(address);
  } else {
    input.style.border = "2px solid red";

    resetPublisherButtons();
    return;
  }


}

async function checkPublisherStatus(address) {

  if (!writeContract || !isOwner){
    currentAccount = document.getElementById("walletInput").value;

    // ✅ Δημιουργία provider (χωρίς signer)
    provider = new ethers.providers.Web3Provider(window.ethereum);

    // ✅ Δημιουργία contract READ-ONLY
    readContract = new ethers.Contract(contractAddress, abi, provider);
    isPublisher = await readContract.isPublisher(currentAccount);

    updateAccessUI();
      
  }else{

    try {

      isPublisher = await writeContract.isPublisher(address);
      if (isPublisher) {
        document.getElementById("publisherBtn").disabled = true;
        document.getElementById("removePublisherBtn").disabled = false;
      } else {
        document.getElementById("publisherBtn").disabled = false;
        document.getElementById("removePublisherBtn").disabled = true;
      }

    } catch (err) {
      console.error(err);
    }

  }
  

}


function resetPublisherButtons() {
  document.getElementById("publisherBtn").disabled = true;
  document.getElementById("removePublisherBtn").disabled = true;
}


function validateRemovePublisher() {

  const btn = document.getElementById("removePublisherBtn");

  if (isValidAddress(addr)) {
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

function isValidHash(hash) {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

function isNotEmpty(value) {
  return value && value.trim() !== "";
}

function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}



function showLoader() {
  document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loadingOverlay").style.display = "none";
}


window.onload = () => {
  document.getElementById("publisherBtn").disabled = true;
  document.getElementById("removePublisherBtn").disabled = true;
  document.getElementById("registerBtn").disabled = true;
  document.getElementById("verifyBtn").disabled = true;
  document.getElementById("getBtn").disabled = true;
  document.getElementById("adminButtons").style.display = "none";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("verifyForm").style.display = "none";
  document.getElementById("getForm").style.display = "none";
};
