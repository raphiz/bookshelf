// Disable the context menu since it's a way to escape the kiosk mode
window.addEventListener("contextmenu", function(e) { e.preventDefault(); });
