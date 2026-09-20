import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Cpu } from 'lucide-react';

export default function WorkshopAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I am your Workshop AI assistant. Ask me anything about machining operations, safety guidelines, tool setups, or troubleshooting diagnostics." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const quickPrompts = [
    { label: "Lathe vs Milling", query: "What is the difference between a Lathe and a Milling machine?" },
    { label: "Safety check rule", query: "What safety rules apply to rotating spindle machines?" },
    { label: "Casting Blowholes", query: "How do I fix blowhole defects in casting?" },
    { label: "SMAW Electrodes", query: "Why is E6013 recommended for sheet metal welding?" }
  ];

  const getAIResponse = (query) => {
    const q = query.toLowerCase();
    
    if (q.includes('lathe') && q.includes('milling')) {
      return "A LATHE rotates the workpiece and feeds a single-point cutting tool (ideal for cylindrical shafts and symmetry). A MILLING machine holds the workpiece stationary on a table and feeds it against a rapidly rotating multi-tooth cutter (ideal for flat slots, gears, and complex prismatic shapes).";
    }
    if (q.includes('safety') || q.includes('glove') || q.includes('spindle')) {
      return "CRITICAL SAFETY RULE: Never wear gloves, loose clothing, or long unsecured hair near rotating machinery (Lathe, Milling, Shaper). They can get caught in the spindle chuck and pull your hand in. However, heavy leather gloves are MANDATORY for welding and casting processes to protect against burns.";
    }
    if (q.includes('blowhole') || q.includes('casting')) {
      return "Blowholes are caused by trapped gases or steam. To fix: 1) Reduce sand moisture content (too wet = high steam). 2) Cut proper venting channels in the sand mould cope. 3) Pour metal smoothly without turbulence to prevent gas entrapment.";
    }
    if (q.includes('electrode') || q.includes('welding') || q.includes('e6013')) {
      return "E6013 is a rutile-coated carbon steel electrode. It operates on AC/DC, strikes an arc easily, produces a stable quiet arc, and deposits a light slag that is easy to remove. This makes it perfect for beginners and light sheet fabrication.";
    }
    if (q.includes('short shot') || q.includes('injection') || q.includes('moulding')) {
      return "A 'Short Shot' occurs when the plastic solidifies before filling the entire cavity. Solutions: 1) Increase injection pressure. 2) Raise barrel heating temperature to lower viscosity. 3) Check gates and air venting channels.";
    }
    if (q.includes('shaper') && q.includes('planer')) {
      return "Shapers use a reciprocating tool over a small workpiece fed sideways (slow cut, fast return). Planers reciprocating a large/heavy workpiece table under stationary tool heads. Shapers are for small parts; Planers are for long beds and guide rails.";
    }
    if (q.includes('clapper') || q.includes('shaper')) {
      return "The clapper box houses the tool holder in shaper and planer machines. It is hinged so the tool lifts slightly and drags freely over the workpiece during the backward return stroke, protecting the tool tip from friction wear.";
    }
    
    return "That is an excellent engineering question. In workshops, we analyze this using factors like cutting parameters (speed/feed/depth of cut), tool materials (carbide/HSS), and thermal characteristics. Could you specify which machine (Lathe, Milling, Welding) you'd like to analyze this for?";
  };

  const handleSend = (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMessage = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const responseText = getAIResponse(query);
      setMessages((prev) => [...prev, { sender: 'ai', text: responseText }]);
    }, 600);
  };

  return (
    <>
      {/* Floating Circle Button */}
      <button 
        className="ai-floating-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF7824 0%, #FF4500 100%)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 120, 36, 0.4)',
          boxShadow: '0 8px 30px rgba(255, 120, 36, 0.45), 0 0 20px rgba(255, 160, 102, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'all 0.3s ease'
        }}
        title="Ask Workshop AI"
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div 
          className="anim-slide-up"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '380px',
            height: '520px',
            zIndex: 10000,
            background: 'rgba(255, 253, 251, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid #FFDEC9',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(255, 120, 36, 0.18), 0 0 30px rgba(255, 120, 36, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden'
          }}
        >
          {/* Chat Header */}
          <div 
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #FFDEC9',
              background: 'linear-gradient(135deg, rgba(255, 120, 36, 0.12) 0%, rgba(255, 160, 102, 0.16) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 120, 36, 0.15)', border: '1px solid #FF7824', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={20} style={{ color: '#FF7824' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#1C1917', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>WORKSHOP AI CO-PILOT</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FF7824', boxShadow: '0 0 8px #FF7824' }}></span>
                  <span style={{ fontSize: '11px', color: '#574A40', fontWeight: '600' }}>Knowledge Engine Active</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#574A40', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, index) => (
              <div 
                key={index}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #FF7824 0%, #FF4500 100%)' : 'rgba(255, 241, 230, 0.85)',
                  border: msg.sender === 'user' ? 'none' : '1px solid #FFDEC9',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#1C1917',
                  boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(255, 120, 36, 0.25)' : 'none'
                }}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Click Prompts */}
          {messages.length === 1 && (
            <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '10px', color: '#E65100', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                SUGGESTED ENQUIRIES
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                 {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.query)}
                    style={{
                      background: 'rgba(255, 241, 230, 0.7)',
                      border: '1px solid #FFDEC9',
                      borderRadius: '14px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#574A40',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#FF7824';
                      e.currentTarget.style.color = '#E65100';
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 120, 36, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#FFDEC9';
                      e.currentTarget.style.color = '#574A40';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div style={{ padding: '14px', borderTop: '1px solid #FFDEC9', background: 'rgba(255, 253, 251, 0.95)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Ask about lathe speeds, welding, safety..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1,
                  background: 'rgba(255, 241, 230, 0.7)',
                  border: '1px solid #FFDEC9',
                  borderRadius: '20px',
                  padding: '10px 16px',
                  color: '#1C1917',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button 
                onClick={() => handleSend()}
                style={{
                  background: 'linear-gradient(135deg, #FF7824 0%, #FF4500 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 0 12px rgba(255, 120, 36, 0.4)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Send size={16} />
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
