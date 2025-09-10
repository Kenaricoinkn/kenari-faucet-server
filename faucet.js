require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
app.use(cors()); // ⬅️ penting untuk izinkan akses dari frontend
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const TOKEN_ADDRESS = process.env.TOKEN_CONTRACT;
const CLAIM_AMOUNT = process.env.CLAIM_AMOUNT || "100";
const CLAIM_DECIMALS = process.env.CLAIM_DECIMALS || 6;

// Provider + wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const faucetWallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Token contract (ERC20 minimal ABI)
const tokenAbi = [
  "function transfer(address to, uint256 amount) public returns (bool)"
];
const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, faucetWallet);

// --- GET untuk cek server ---
app.get("/faucet", (req, res) => {
  res.json({ message: "✅ Faucet server alive, use POST to claim" });
});

// --- POST untuk klaim token ---
app.post("/faucet", async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: "No address provided" });

    const amount = ethers.parseUnits(CLAIM_AMOUNT.toString(), CLAIM_DECIMALS);
    const tx = await token.transfer(address, amount);
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error("Faucet error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Jalankan server ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Faucet server running on port ${PORT}`);
  console.log(`Faucet Wallet: ${faucetWallet.address}`);
  console.log(`Token KN: ${TOKEN_ADDRESS}`);
});
