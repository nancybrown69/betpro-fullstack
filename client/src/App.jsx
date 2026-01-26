import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Auth
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  // Wallet
  const [activeTab, setActiveTab] = useState('home')
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  // Game (Slot)
  const [gameResult, setGameResult] = useState(['🍒', '🍋', '🔔'])
  const [isSpinning, setIsSpinning] = useState(false)
  const [winMessage, setWinMessage] = useState('')
  const [bet, setBet] = useState(10)

  // Admin Data
  const [adminData, setAdminData] = useState({ users: [], transactions: [], winRate: 40 })

  // --- API CALLS ---
  const handleAuth = async () => {
    try {
        const endpoint = isRegister ? '/api/register' : '/api/login';
        const res = await axios.post(`http://localhost:5000${endpoint}`, { username, password });
        if (res.data.success) {
            if (res.data.isAdmin) { setIsAdmin(true); fetchAdminData(); } 
            else setUser(res.data.user);
        } else alert(res.data.message);
    } catch(e) { alert('Server Error'); }
  }

  // --- SLOT GAME LOGIC ---
  const handleSpin = async () => {
      if(user.balance < bet) return alert("Low Balance!");
      setIsSpinning(true); setWinMessage('');
      
      try {
          const res = await axios.post('http://localhost:5000/api/play-game', { username: user.username, betAmount: bet });
          setTimeout(() => {
              setIsSpinning(false);
              if(res.data.success) {
                  setGameResult(res.data.result);
                  setUser(res.data.user);
                  if(res.data.isWin) setWinMessage(`🎉 WON ৳${res.data.winnings}!`);
                  else setWinMessage('❌ Lost! Try Again.');
              }
          }, 2000); // 2s Animation
      } catch(e) { setIsSpinning(false); alert("Error"); }
  }

  // --- ADMIN FUNCTIONS ---
  const fetchAdminData = async () => {
      const res = await axios.get('http://localhost:5000/api/admin/data');
      setAdminData(res.data);
  }
  const changeRate = async (rate) => {
      await axios.post('http://localhost:5000/api/admin/set-rate', { rate });
      fetchAdminData(); alert(`Win Rate: ${rate}%`);
  }
  const handleBalanceEdit = async (username) => {
      const amount = prompt(`Enter Amount for ${username} (Use - to deduct):`);
      if(!amount) return;
      await axios.post('http://localhost:5000/api/admin/update-balance', { username, amount });
      fetchAdminData();
  }
  const handleResetPass = async (username) => {
      const newPass = prompt(`New Password for ${username}:`);
      if(!newPass) return;
      await axios.post('http://localhost:5000/api/admin/reset-password', { username, newPassword: newPass });
      alert("Password Changed!");
  }
  const handleDeleteUser = async (username) => {
      if(!confirm(`Delete ${username}?`)) return;
      await axios.post('http://localhost:5000/api/admin/delete-user', { username });
      fetchAdminData(); alert("User Deleted!");
  }

  // --- USER WALLET ---
  const handleDeposit = async () => {
    if(!depositAmount) return alert("Enter Amount");
    alert("Connecting Gateway...");
    const res = await axios.post('http://localhost:5000/api/deposit/execute', { username: user.username, amount: depositAmount, method: 'bKash' });
    if(res.data.success) { setUser(res.data.user); alert("✅ Verified!"); setDepositAmount(''); }
  }
  const handleWithdraw = async () => {
    if(!withdrawAmount) return alert("Enter Amount");
    alert("Processing Payout...");
    const res = await axios.post('http://localhost:5000/api/withdraw/execute', { username: user.username, amount: withdrawAmount, method: 'bKash', number: '017...' });
    if(res.data.success) { setUser(res.data.user); alert("✅ Sent!"); setWithdrawAmount(''); }
  }

  // --- LOGIN SCREEN ---
  if (!user && !isAdmin) {
    return (
      <div style={{padding:'40px', textAlign:'center', marginTop:'50px'}}>
        <h1 style={{color:'#00d2d3'}}>BetPro Live</h1>
        <div className="wallet-box">
          <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button onClick={handleAuth} style={{background:'#00d2d3', color:'black'}}>{isRegister ? 'REGISTER' : 'LOGIN'}</button>
          <p onClick={() => setIsRegister(!isRegister)} style={{marginTop:'15px', color:'gray'}}>{isRegister ? 'Login' : 'Create Account'}</p>
        </div>
      </div>
    )
  }

  // --- MASTER ADMIN PANEL ---
  if (isAdmin) {
      return (
          <div>
              <div className="header" style={{background:'#d63031'}}>
                  <div className="logo">👑 Master Admin</div>
                  <button onClick={() => setIsAdmin(false)} style={{background:'#2d3436', padding:'5px 10px'}}>Logout</button>
              </div>
              <div style={{padding:'15px'}}>
                  <div className="wallet-box">
                      <h3 style={{color:'yellow', textAlign:'center'}}>Win Rate: {adminData.winRate}%</h3>
                      <div style={{display:'flex', justifyContent:'center', gap:'5px', marginTop:'10px'}}>
                          <button onClick={()=>changeRate(0)} style={{background:'red', width:'50px'}}>0%</button>
                          <button onClick={()=>changeRate(40)} style={{background:'orange', width:'50px'}}>40%</button>
                          <button onClick={()=>changeRate(100)} style={{background:'green', width:'50px'}}>100%</button>
                      </div>
                  </div>
                  <div className="section-title">Users</div>
                  {adminData.users.map(u => (
                      <div key={u._id} className="wallet-box" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <div><b>{u.username}</b> <br/><small style={{color:'gold'}}>৳{u.balance}</small></div>
                          <div style={{display:'flex', gap:'5px'}}>
                              <button onClick={()=>handleBalanceEdit(u.username)} style={{background:'#0984e3'}}>💵</button>
                              <button onClick={()=>handleResetPass(u.username)} style={{background:'#e17055'}}>🔑</button>
                              <button onClick={()=>handleDeleteUser(u.username)} style={{background:'#d63031'}}>❌</button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  // --- USER APP ---
  return (
    <div>
      <div className="header"><div className="logo">BetPro</div><div className="balance-badge">৳ {user.balance}</div></div>
      <div style={{paddingBottom:'80px'}}>
        {activeTab === 'home' && (
          <>
            <div className="banner">🎰 SUPER CASINO 🎰</div>
            <div className="slot-machine">
                <div className={`slot-window ${isSpinning?'spinning':''}`}>
                    <div className="reel">{gameResult[0]}</div><div className="reel">{gameResult[1]}</div><div className="reel">{gameResult[2]}</div>
                </div>
                <div style={{marginTop:'10px', color: winMessage.includes('WON')?'#2ecc71':'#ff7675'}}>{winMessage}</div>
                <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:'10px', marginTop:'10px'}}>
                    <span>BET:</span><input type="number" value={bet} onChange={e=>setBet(e.target.value)} style={{width:'60px', textAlign:'center', margin:0}} />
                </div>
                <button className="spin-btn" onClick={handleSpin} disabled={isSpinning}>{isSpinning?'...':'SPIN'}</button>
            </div>
          </>
        )}
        {activeTab === 'wallet' && (
          <>
            <div className="wallet-box">
              <h3>Deposit</h3><input type="number" placeholder="Amount" onChange={e=>setDepositAmount(e.target.value)} />
              <button onClick={handleDeposit} style={{background:'#238636'}}>PAY WITH BKASH</button>
            </div>
            <div className="wallet-box" style={{border:'1px solid #da3633'}}>
              <h3>Withdraw</h3><input type="number" placeholder="Amount" onChange={e=>setWithdrawAmount(e.target.value)} />
              <button onClick={handleWithdraw} style={{background:'#da3633'}}>WITHDRAW</button>
            </div>
          </>
        )}
      </div>
      <div className="bottom-nav">
        <div className={`nav-item ${activeTab==='home'?'active':''}`} onClick={()=>setActiveTab('home')}><span className="nav-icon">🏠</span>Home</div>
        <div className={`nav-item ${activeTab==='wallet'?'active':''}`} onClick={()=>setActiveTab('wallet')}><span className="nav-icon">💰</span>Wallet</div>
        <div className="nav-item" onClick={()=>setUser(null)}><span className="nav-icon">🚪</span>Exit</div>
      </div>
    </div>
  )
}

export default App