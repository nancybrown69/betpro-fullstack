import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// 🔥 FINAL LIVE SERVER LINK
const API_URL = 'https://betpro-server-f.onrender.com'; 

function App() {
  // --- STATES ---
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('home') // home, casino, wallet, admin
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

  // --- API FUNCTIONS ---

  const handleAuth = async () => {
    if(!username || !password) return alert("Please fill all fields!");
    try {
        const endpoint = isRegister ? '/api/register' : '/api/login';
        // console.log("Connecting to:", API_URL + endpoint); // Debugging
        const res = await axios.post(`${API_URL}${endpoint}`, { username, password });
        
        if (res.data.success) {
            if (res.data.isAdmin) { 
                setIsAdmin(true); 
                fetchAdminData(); 
            } else {
                setUser(res.data.user);
            }
        } else {
            alert(res.data.message);
        }
    } catch(e) { 
        console.error(e);
        alert('Connection Error! Server might be sleeping. Please try again in 10 seconds.'); 
    }
  }

  const handleSpin = async () => {
      if(user.balance < bet) return alert("Not enough balance! Please Deposit.");
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
      } catch(e) { 
          setIsSpinning(false); 
          alert("Game Error! Check internet.");
      }
  }

  const fetchAdminData = async () => {
      try {
          const res = await axios.get(`${API_URL}/api/admin/data`);
          setAdminData(res.data);
      } catch(e) { console.error(e); }
  }

  // --- 1. LOGIN SCREEN ---
  if (!user && !isAdmin) {
    return (
      <div style={{padding:'50px 20px', textAlign:'center', background:'#0b1e28', height:'100vh', display:'flex', flexDirection:'column', justifyContent:'center'}}>
        <h1 className="logo-text" style={{fontSize:'40px', marginBottom:'40px'}}>Okzz<span style={{color:'#00e676'}}>Pro</span></h1>
        
        <div style={{background:'#142832', padding:'30px', borderRadius:'10px', border:'1px solid #1e3b48', maxWidth:'400px', margin:'0 auto', width:'100%'}}>
            <input 
                style={{background:'#0b1e28', border:'1px solid #1e3b48', color:'white', width:'100%', padding:'15px', marginBottom:'15px', borderRadius:'5px', fontSize:'16px'}} 
                placeholder="Username" 
                onChange={e => setUsername(e.target.value)} 
            />
            <input 
                type="password" 
                style={{background:'#0b1e28', border:'1px solid #1e3b48', color:'white', width:'100%', padding:'15px', marginBottom:'20px', borderRadius:'5px', fontSize:'16px'}} 
                placeholder="Password" 
                onChange={e => setPassword(e.target.value)} 
            />
            <button 
                style={{width:'100%', padding:'15px', background:'#00e676', border:'none', fontWeight:'bold', cursor:'pointer', fontSize:'18px', borderRadius:'5px', color:'#000'}} 
                onClick={handleAuth}
            >
                {isRegister ? 'REGISTER NOW' : 'LOG IN'}
            </button>
            <p onClick={() => setIsRegister(!isRegister)} style={{marginTop:'20px', color:'#fff', cursor:'pointer', textDecoration:'underline'}}>
                {isRegister ? 'Already have an account? Login' : 'Create New Account'}
            </p>
        </div>
      </div>
    )
  }

  // --- 2. ADMIN DASHBOARD ---
  if (isAdmin) {
      return (
          <div style={{padding:'20px', background:'#0b1e28', minHeight:'100vh', color:'white'}}>
              <h2 style={{color:'#00e676'}}>👑 ADMIN CONTROL</h2>
              <div style={{background:'#142832', padding:'20px', marginTop:'20px', borderRadius:'10px', border:'1px solid #1e3b48'}}>
                  <p style={{fontSize:'20px'}}>Total Users: <strong>{adminData.users.length}</strong></p>
                  <p style={{fontSize:'20px'}}>Win Rate: <strong>{adminData.winRate}%</strong></p>
              </div>
              <button onClick={() => setIsAdmin(false)} style={{marginTop:'30px', background:'#ff4757', color:'white', padding:'15px', border:'none', width:'100%', borderRadius:'5px', fontSize:'16px', fontWeight:'bold'}}>Logout</button>
          </div>
      )
  }

  // --- 3. MAIN APP INTERFACE ---
  return (
    <div>
      {/* HEADER */}
      <div className="header">
        <div className="logo-text">Okzz<span style={{color:'#00e676', fontSize:'18px'}}>Pro</span></div>
        <div style={{color:'#fff', fontWeight:'bold', background:'#142832', padding:'8px 15px', borderRadius:'20px', border:'1px solid #00e676', fontSize:'14px'}}>
            ৳ {user.balance}
        </div>
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

            {/* NOTICE BAR */}
            <div className="notice-bar">
                📢 Welcome to OkzzPro! The trusted betting platform. Live server connected!
            </div>

            {/* QUICK ACTIONS */}
            <div className="action-row">
                <button className="action-btn btn-dep" onClick={()=>setActiveTab('wallet')}>📥 Deposit</button>
                <button className="action-btn btn-with" onClick={()=>setActiveTab('wallet')}>📤 Withdraw</button>
            </div>

            {/* GAME GRID */}
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
                    <div className="g-title">CARDS</div>
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

      {/* CASINO PAGE */}
      {activeTab === 'casino' && (
          <div className="slot-area">
             <div style={{color:'white', marginBottom:'20px', fontWeight:'bold', fontSize:'20px'}}>SUPER JACKPOT</div>
             <div className="slot-display">
                 <span>{gameResult[0]}</span>
                 <span>{gameResult[1]}</span>
                 <span>{gameResult[2]}</span>
             </div>
             
             <div style={{color: winMessage.includes('WIN')?'#00e676':'#ff4757', fontWeight:'bold', height:'30px', fontSize:'18px', marginTop:'10px'}}>
                 {isSpinning ? 'SPINNING...' : winMessage}
             </div>

             <div style={{display:'flex', justifyContent:'center', alignItems:'center', marginTop:'20px', gap:'10px'}}>
                 <span style={{color:'white'}}>BET:</span>
                 <input 
                    type="number" 
                    value={bet} 
                    onChange={e=>setBet(e.target.value)} 
                    style={{width:'100px', padding:'10px', textAlign:'center', borderRadius:'5px', border:'none', fontSize:'16px'}} 
                 />
             </div>
             
             <button className="spin-button" onClick={handleSpin} disabled={isSpinning} style={{marginTop:'20px'}}>
                 {isSpinning ? '...' : 'SPIN NOW'}
             </button>
          </div>
      )}

      {/* WALLET PAGE */}
      {activeTab === 'wallet' && (
          <div style={{padding:'20px', textAlign:'center'}}>
              <h2 style={{color:'white'}}>My Wallet</h2>
              <h1 style={{color:'#00e676', fontSize:'40px', margin:'20px 0'}}>৳ {user.balance}</h1>
              
              <div style={{background:'#142832', padding:'20px', borderRadius:'10px', marginBottom:'20px', border:'1px solid #1e3b48'}}>
                  <h3 style={{color:'#ffd700', marginBottom:'10px'}}>Deposit Method</h3>
                  <p style={{color:'#b2bec3', fontSize:'18px'}}>bKash: 017xxxxxxxx</p>
                  <p style={{color:'#b2bec3', fontSize:'18px'}}>Nagad: 018xxxxxxxx</p>
                  <p style={{fontSize:'12px', color:'#7f8c8d', marginTop:'15px'}}>* Send money and contact admin on WhatsApp to add balance.</p>
              </div>

              <button className="primary-btn" onClick={() => alert('Contact Admin on Telegram/WhatsApp')} style={{background:'#00e676', color:'black', width:'100%', padding:'15px', border:'none', borderRadius:'5px', fontWeight:'bold', fontSize:'16px'}}>
                  CONTACT SUPPORT
              </button>
          </div>
      )}

      </div>

      {/* BOTTOM NAVIGATION */}
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