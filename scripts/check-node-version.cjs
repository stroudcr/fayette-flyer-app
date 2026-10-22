const [major, minor, patch] = process.versions.node.split(".").map(Number);
console.log("Node.js runtime: " + process.version);
if (major !== 24 || minor < 22 || (minor === 22 && patch < 1)) {
  console.error("Node.js 24.22.1 or a newer 24.x release is required for the October 21, 2026 security fixes.");
  process.exit(1);
}
