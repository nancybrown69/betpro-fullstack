import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// আপনার লাইভ সার্ভার লিংক এখানে বসাবেন (যদি লোকাল হয় তবে http://localhost:5000)
const API_URL = 'http://localhost:5000'; 

function App() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('home') 
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Auth States
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  // Game States
  const [gameResult, setGameResult] = useState(['🍒', '🍒', '🍒'])
  const [isSpinning, setIsSpinning] = useState(false)
  const [winMessage, setWinMessage] = useState('')
  const [bet, setBet] = useState(50)

  // Admin Data
  const [adminData, setAdminData] = useState({ users: [], transactions: [], winRate: 40 })

  // --- API LOGIC ---
  const handleAuth = async () => {
    try {
        const endpoint = isRegister ? '/api/register' : '/api/login';
        const res = await axios.post(`${API_URL}${endpoint}`, { username, password });
        if (res.data.success) {
            if (res.data.isAdmin) { setIsAdmin(true); fetchAdminData(); } 
            else setUser(res.data.user);
        } else alert(res.data.message);
    } catch(e) { alert('Server Error'); }
  }

  const handleSpin = async () => {
      if(user.balance < bet) return alert("Not enough balance!");
      setIsSpinning(true); setWinMessage('');
      try {
          const res = await axios.post(`${API_URL}/api/play-game`, { username: user.username, betAmount: bet });
          setTimeout(() => {
              setIsSpinning(false);
              if(res.data.success) {
                  setGameResult(res.data.result);
                  setUser(res.data.user);
                  setWinMessage(res.data.isWin ? `WIN: ৳${res.data.winnings}` : 'LOST');
              }
          }, 1500);
      } catch(e) { setIsSpinning(false); }
  }

  const fetchAdminData = async () => {
      const res = await axios.get(`${API_URL}/api/admin/data`);
      setAdminData(res.data);
  }

  // --- 1. LOGIN PAGE (Dark Style) ---
  if (!user && !isAdmin) {
    return (
      <div style={{padding:'50px 20px', textAlign:'center', background:'#0b1e28', height:'100vh'}}>
        <h1 className="logo-text" style={{fontSize:'50px', marginBottom:'40px'}}>Okzz<span style={{color:'white'}}>Pro</span></h1>
        <div style={{background:'#142832', padding:'30px', borderRadius:'10px', border:'1px solid #1e3b48'}}>
            <input style={{background:'#0b1e28', border:'1px solid #1e3b48', color:'white', width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'5px'}} 
                   placeholder="Username" onChange={e => setUsername(e.target.value)} />
            <input type="password" style={{background:'#0b1e28', border:'1px solid #1e3b48', color:'white', width:'100%', padding:'12px', marginBottom:'20px', borderRadius:'5px'}} 
                   placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <button style={{width:'100%', padding:'12px', background:'#00e676', border:'none', fontWeight:'bold', cursor:'pointer'}} onClick={handleAuth}>
                {isRegister ? 'REGISTER' : 'LOG IN'}
            </button>
            <p onClick={() => setIsRegister(!isRegister)} style={{marginTop:'15px', color:'#7f8c8d', cursor:'pointer'}}>
                {isRegister ? 'Login Account' : 'Create New Account'}
            </p>
        </div>
      </div>
    )
  }

  // --- 2. ADMIN PANEL ---
  if (isAdmin) {
      return (
          <div style={{padding:'20px'}}>
              <h2>ADMIN CONTROL</h2>
              <p>Total Users: {adminData.users.length}</p>
              <button onClick={() => setIsAdmin(false)} style={{background:'red', color:'white', padding:'10px'}}>Logout</button>
          </div>
      )
  }

  // --- 3. MAIN APP (Okzz UI) ---
  return (
    <div>
      {/* HEADER */}
      <div className="header">
        <div className="logo-text">Okzz<span style={{color:'white', fontSize:'18px'}}>Pro</span></div>
        <div style={{color:'#fff', fontWeight:'bold'}}>৳ {user.balance}</div>
      </div>

      <div style={{paddingBottom:'80px'}}>
      
      {activeTab === 'home' && (
        <>
            {/* SLIDER */}
            <div className="slider">
                <div className="banner-img">
                    <div className="banner-text">WELCOME BONUS 100%</div>
                </div>
            </div>

            {/* NOTICE */}
            <div className="notice-bar">
                📢 Welcome to OkzzPro! Deposit now via bKash/Nagad and get 5% extra bonus! Withdrawal time 10AM - 10PM.
            </div>

            {/* QUICK ACTIONS */}
            <div className="action-row">
                <button className="action-btn btn-dep" onClick={()=>alert('Use Wallet Tab')}>📥 Deposit</button>
                <button className="action-btn btn-with" onClick={()=>alert('Use Wallet Tab')}>📤 Withdraw</button>
            </div>

            {/* LIVE GAMES */}
            <div className="section-head">
                <span style={{color:'white', fontWeight:'bold'}}>🔥 Popular Games</span>
                <span className="see-all">See All</span>
            </div>
            <div className="game-grid">
                <div className="game-box" onClick={() => setActiveTab('casino')}>
                    <div className="g-img">🎰</div>
                    <div className="g-title">SLOT</div>
                </div>
                <div className="game-box">
                    <div className="g-img">✈️</div>
                    <div className="g-title">CRASH</div>
                </div>
                <div className="game-box">
                    <div className="g-img">⚽</div>
                    <div className="g-title">SPORTS</div>
                </div>
                <div className="game-box">
                    <div className="g-img">🃏</div>
                    <div className="g-title">TEEN PATTI</div>
                </div>
                <div className="game-box">
                    <div className="g-img">🎡</div>
                    <div className="g-title">WHEEL</div>
                </div>
                <div className="game-box">
                    <div className="g-img">🎲</div>
                    <div className="g-title">LUDO</div>
                </div>
            </div>
        </>
      )}

      {/* SLOT MACHINE PAGE */}
      {activeTab === 'casino' && (
          <div className="slot-area">
             <div style={{color:'white', marginBottom:'20px'}}>SUPER JACKPOT</div>
             <div className="slot-display">
                 <span>{gameResult[0]}</span><span>{gameResult[1]}</span><span>{gameResult[2]}</span>
             </div>
             <div style={{color: winMessage.includes('WIN')?'#00e676':'red', fontWeight:'bold', height:'30px'}}>
                 {isSpinning ? '...' : winMessage}
             </div>
             <input type="number" value={bet} onChange={e=>setBet(e.target.value)} style={{width:'80px', padding:'5px', margin:'10px', textAlign:'center'}} />
             <button className="spin-button" onClick={handleSpin} disabled={isSpinning}>SPIN NOW</button>
          </div>
      )}

      {/* WALLET PAGE */}
      {activeTab === 'wallet' && (
          <div style={{padding:'20px', textAlign:'center'}}>
              <h2 style={{color:'white'}}>My Wallet</h2>
              <h1 style={{color:'#00e676', fontSize:'40px', margin:'20px 0'}}>৳ {user.balance}</h1>
              <div style={{background:'#142832', padding:'20px', borderRadius:'10px'}}>
                  <p style={{color:'#b2bec3'}}>bKash Personal: 017xxxxxxxx</p>
                  <p style={{color:'#b2bec3'}}>Nagad Personal: 018xxxxxxxx</p>
              </div>
          </div>
      )}

      </div>

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
          <div className={`nav-item ${activeTab==='home'?'active':''}`} onClick={()=>setActiveTab('home')}>
              <span className="nav-icon">🏠</span>Home
          </div>
          <div className="nav-item">
              <span className="nav-icon">🏆</span>Sports
          </div>
          <div className={`nav-item ${activeTab==='casino'?'active':''}`} onClick={()=>setActiveTab('casino')}>
              <span className="nav-icon">🎰</span>Casino
          </div>
          <div className={`nav-item ${activeTab==='wallet'?'active':''}`} onClick={()=>setActiveTab('wallet')}>
              <span className="nav-icon">💰</span>Wallet
          </div>
          <div className="nav-item" onClick={()=>setUser(null)}>
              <span className="nav-icon">👤</span>Account
          </div>
      </div>
    </div>
  )
}

export default App