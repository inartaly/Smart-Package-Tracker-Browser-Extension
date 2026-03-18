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
  const clean = num.replace(/\s+/g, "").toUpperCase();

  // UPS: 1Z + 16 chars
  if (/^1Z[0-9A-Z]{16}$/.test(clean)) {
    return "https://www.ups.com/track?track=yes&trackNums=";
  }

  // USPS: 20–22 digits (must be BEFORE FedEx)
  if (/^\d{20,22}$/.test(clean)) {
    return "https://tools.usps.com/go/TrackConfirmAction?tLabels=";
  }

  // FedEx: 12, 15, 20, 22 digits
  if (
    /^\d{12}$/.test(clean) ||
    /^\d{15}$/.test(clean) ||
    /^\d{20}$/.test(clean) ||
    /^\d{22}$/.test(clean)
  ) {
    return "https://www.fedex.com/fedextrack/?trknbr=";
  }

  // DHL Express
  if (
    /^\d{10}$/.test(clean) ||
    /^3S[0-9A-Z]+$/.test(clean) ||
    /^JVGL[0-9A-Z]+$/.test(clean) ||
    /^GM[0-9A-Z]+$/.test(clean)
  ) {
    return "https://www.dhl.com/us-en/home/tracking.html?tracking-id=";
  }

  // Amazon Logistics (TBA/TBM/TBC)
  if (/^TB[A-Z]\d{12,20}$/.test(clean)) {
    return "https://track.amazon.com/tracking/";
  }

  // LaserShip
  if (/^[A-Z]\d{8}$/.test(clean) || /^LS\d{8,12}$/.test(clean)) {
    return "https://www.lasership.com/track/";
  }

  // OnTrac
  if (/^C\d{14}$/.test(clean)) {
    return "https://www.ontrac.com/trackingres.asp?tracking_number=";
  }

  return null;
}
