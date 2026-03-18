chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "trackPackage",
    title: "Track Package",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "trackPackage") return;

  const tracking = info.selectionText?.trim();
  if (!tracking) return;

  console.log("Tracking number selected:", tracking);

  // Copy to clipboard using background page
  try {
    await navigator.clipboard.writeText(tracking);
    console.log("Copied to clipboard");
  } catch (err) {
    console.warn("Clipboard write failed:", err);
  }

  const carrierUrl = detectCarrier(tracking);

  const finalUrl = carrierUrl
    ? carrierUrl + tracking
    : "https://www.google.com/search?q=" +
      encodeURIComponent(tracking + " tracking");

  chrome.tabs.create({ url: finalUrl });
});

function detectCarrier(num) {
  if (/^1Z[0-9A-Z]{16}$/i.test(num)) {
    return "https://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=";
  }

  if (
    /^\d{12}$/.test(num) ||
    /^\d{15}$/.test(num) ||
    /^\d{20}$/.test(num) ||
    /^\d{22}$/.test(num)
  ) {
    return "https://www.fedex.com/fedextrack/?trknbr=";
  }

  if (/^\d{20,22}$/.test(num)) {
    return "https://tools.usps.com/go/TrackConfirmAction?tLabels=";
  }

  return null;
}
