document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById("refresh");
  const statusDiv = document.getElementById("status");
  const countDiv = document.getElementById("count");

  refreshBtn.addEventListener("click", async () => {
    chrome.runtime.sendMessage({ type: 'REFRESH_BLOCKED' }, (response) => {
      statusDiv.innerText = "Blocked sites refreshed!";
      setTimeout(() => {
        statusDiv.innerText = "";
      }, 2000);
      updateCount();
    });
  });

  function updateCount() {
    chrome.runtime.sendMessage({ type: 'GET_BLOCKED_SITES' }, (response) => {
      if (response && response.sites) {
        const activeCount = response.sites.filter(s => s.isActive).length;
        countDiv.innerText = `${activeCount} site(s) currently blocked`;
      }
    });
  }

  updateCount();
});