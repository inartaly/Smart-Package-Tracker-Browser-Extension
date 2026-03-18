chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "trackPackage",
    title: "Track Package",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "trackPackage") return;

  const tracking = info.selectionText.trim();

  // Copy to clipboard
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: text => navigator.clipboard.writeText(text),
    args: [tracking]
  });

  // Detect carrier
  const carrier = detectCarrier(tracking);

  if (!carrier) {
    chrome.tabs.create({
      url: "https://google.com/search?q=" + encodeURIComponent(tracking + " tracking")
    });
    return;
  }

  chrome.tabs.create({ url: carrier + tracking });
});

function detectCarrier(num) {
  // UPS: starts with 1Z
  if (/^1Z[0-9A-Z]{16}$/i.test(num)) {
    return "https://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=";
  }

  // FedEx: 12, 15, 20, 22 digits
  if (/^\d{12}$/.test(num) || /^\d{15}$/.test(num) || /^\d{20}$/.test(num) || /^\d{22}$/.test(num)) {
    return "https://www.fedex.com/fedextrack/?trknbr=";
  }

  // USPS: 20–22 digits
  if (/^\d{20,22}$/.test(num)) {
    return "https://tools.usps.com/go/TrackConfirmAction?tLabels=";
  }

  return null;
}
