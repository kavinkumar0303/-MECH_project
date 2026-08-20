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
        style={{ color: 'var(--accent-orange)' }}
        title="Ask Workshop AI"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div 
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '360px',
            height: '480px',
            zIndex: 1000,
            background: 'var(--bg-secondary)',
            borderColor: 'var(--accent-orange)',
            boxShadow: '0 10px 40px rgba(242, 140, 40, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden'
          }}
        >
          {/* Chat Header */}
          <div 
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--border)',
              background: 'rgba(242, 140, 40, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Cpu size={20} style={{ color: 'var(--accent-orange)' }} />
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase' }}>WORKSHOP CO-PILOT</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: 'var(--success)' }}></span>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Knowledge Base Online</span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, index) => (
              <div 
                key={index}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.sender === 'user' ? 'rgba(242, 140, 40, 0.08)' : 'var(--surface)',
                  border: msg.sender === 'user' ? '1px solid var(--accent-orange)' : '1px solid var(--border)',
                  borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  color: msg.sender === 'user' ? '#FFF' : 'var(--text-primary)'
                }}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Click Prompts */}
          {messages.length === 1 && (
            <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '4px', letterSpacing: '0.5px' }}>
                SUGGESTED ENQUIRIES
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.query)}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-orange)';
                      e.currentTarget.style.color = 'var(--accent-orange)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div style={{ padding: '12px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Ask details..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button 
                onClick={() => handleSend()}
                style={{
                  background: 'var(--accent-orange)',
                  color: '#151719',
                  border: 'none',
                  borderRadius: '4px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 10px rgba(242, 140, 40, 0.4)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
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
