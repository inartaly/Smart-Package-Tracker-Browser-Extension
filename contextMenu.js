chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "trackPackage",
    title: "Track Package",
    contexts: ["selection"]
  });
});
