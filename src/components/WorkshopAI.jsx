import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Cpu } from 'lucide-react';
import { generateWorkshopAIResponse } from '../simulation/workshopAIEngine';

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

  const handleSend = (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMessage = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const responseText = generateWorkshopAIResponse(query);
      setMessages((prev) => [...prev, { sender: 'ai', text: responseText }]);
    }, 400);
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
          background: 'linear-gradient(135deg, #0077B6 0%, #00509D 100%)',
          color: '#FFFFFF',
          border: '1px solid rgba(0, 119, 182, 0.4)',
          boxShadow: '0 8px 30px rgba(0, 119, 182, 0.45), 0 0 20px rgba(255, 160, 102, 0.3)',
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
          className="ai-chat-drawer anim-slide-up"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 120px)',
            zIndex: 10000,
            background: 'rgba(255, 253, 251, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid #BAE6FD',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(0, 119, 182, 0.18), 0 0 30px rgba(0, 119, 182, 0.1)',
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
              borderBottom: '1px solid #BAE6FD',
              background: 'linear-gradient(135deg, rgba(0, 119, 182, 0.12) 0%, rgba(255, 160, 102, 0.16) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 119, 182, 0.15)', border: '1px solid #0077B6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={20} style={{ color: '#0077B6' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#1C1917', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>WORKSHOP AI CO-PILOT</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0077B6', boxShadow: '0 0 8px #0077B6' }}></span>
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
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #0077B6 0%, #00509D 100%)' : 'rgba(255, 241, 230, 0.85)',
                  border: msg.sender === 'user' ? 'none' : '1px solid #BAE6FD',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#1C1917',
                  boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(0, 119, 182, 0.25)' : 'none'
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
              <span style={{ fontSize: '10px', color: '#023E8A', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                SUGGESTED ENQUIRIES
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                 {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.query)}
                    style={{
                      background: 'rgba(255, 241, 230, 0.7)',
                      border: '1px solid #BAE6FD',
                      borderRadius: '14px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#574A40',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0077B6';
                      e.currentTarget.style.color = '#023E8A';
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 119, 182, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#BAE6FD';
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
          <div style={{ padding: '14px', borderTop: '1px solid #BAE6FD', background: 'rgba(255, 253, 251, 0.95)' }}>
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
                  border: '1px solid #BAE6FD',
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
                  background: 'linear-gradient(135deg, #0077B6 0%, #00509D 100%)',
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
                  boxShadow: '0 0 12px rgba(0, 119, 182, 0.4)'
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
