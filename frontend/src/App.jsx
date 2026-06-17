import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Send, Loader2, Lightbulb, CalendarDays, ArrowRight, Layers, Image as ImageIcon } from 'lucide-react';
import myLogo from './assets/logo.svg'

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-noise pt-32 pb-20 flex flex-col items-center">
      <div className="max-w-5xl w-full px-8 flex flex-col items-start mb-32 mt-12">
        <h1 className="text-6xl md:text-8xl font-serif text-paper mb-8 tracking-tighter leading-[1.1]">
          The Magic Behind <br />
          <span className="italic text-muted font-light">The Campaigns You Envy.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl font-sans max-w-2xl mb-12 font-light leading-relaxed">
          Kill the blank page. Skip the plastic content. 3afreet cooks up the big idea and hands you a ready to post calendar. You just take the credit.
        </p>
        <button 
          onClick={() => navigate('/studio')}
          className="bg-rust text-paper px-10 py-5 text-xs font-sans uppercase tracking-widest hover:bg-opacity-90 transition-all rounded-sm flex items-center gap-4 border border-rust"
        >
          AWAKEN 3AFREET <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full max-w-5xl px-8">
        <div className="border-t border-divider pt-16">
          <h2 className="text-xs font-sans text-rust uppercase tracking-widest mb-12">THE ARSENAL</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t border-divider">
            <div className="p-12 border-r border-b border-divider hover:bg-surface transition-colors duration-500 group">
              <div className="text-xs text-muted font-sans mb-8">01</div>
              <h3 className="font-serif text-paper text-3xl mb-4 group-hover:text-rust transition-colors duration-300">Conceptualize</h3>
              <p className="font-sans text-muted text-sm leading-relaxed">
                We don't do basic. 3afreet engineers high concept, metaphor driven themes with psychological hooks that make your brand impossible to ignore.
              </p>
            </div>

            <div className="p-12 border-r border-b border-divider hover:bg-surface transition-colors duration-500 group">
              <div className="text-xs text-muted font-sans mb-8">02</div>
              <h3 className="font-serif text-paper text-3xl mb-4 group-hover:text-rust transition-colors duration-300">Strategize</h3>
              <p className="font-sans text-muted text-sm leading-relaxed">
                Ideas are useless without a plan. 3afreet translates your winning concept into a ruthless, multi format content calendar ready for launch.
              </p>
            </div>

            <div className="p-12 border-r border-b border-divider hover:bg-surface transition-colors duration-500 group">
              <div className="text-xs text-muted font-sans mb-8">03</div>
              <h3 className="font-serif text-paper text-3xl mb-4 group-hover:text-rust transition-colors duration-300">Execute</h3>
              <p className="font-sans text-muted text-sm leading-relaxed">
                The heavy lifting is done. Get sharp, ready to publish copy paired with elite Midjourney art direction prompts. Your only job is hitting publish.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Studio() {
  const [messages, setMessages] = useState([{ sender: '3afreet', text: '3afreet is waiting. Drop your brief here, and let the magic happen.' }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFetchingIdeas, setIsFetchingIdeas] = useState(false);
  const [ideasData, setIdeasData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignData, setCampaignData] = useState(null);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput("");
    setIsTyping(true);
    try {
      const response = await fetch("https://m-o-a-z-3afreet-api.hf.space/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: messages })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { sender: '3afreet', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: '3afreet', text: 'Connection lost. The magic needs a stable backend to work.' }]);
    }
    setIsTyping(false);
  };

  const generateIdeas = async () => {
    setIsFetchingIdeas(true);
    setCampaignData(null); 
    setMessages(prev => [...prev, { sender: 'user', text: 'Give me the killer angles.' }]);
    try {
      const response = await fetch("https://m-o-a-z-3afreet-api.hf.space/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_summary: messages.map(m => `${m.sender}: ${m.text}`).join('\n') })
      });
      const data = await response.json();
      if (data.status === "success") {
        setIdeasData(data.ideas);
        setMessages(prev => [...prev, { sender: '3afreet', text: 'The board is set. Review the concepts.' }]);
      }
    } catch (error) {
      console.error(error);
    }
    setIsFetchingIdeas(false);
  };

  const generateFullCampaign = async () => {
    setIsGenerating(true);
    setIdeasData(null);
    setMessages(prev => [...prev, { sender: 'user', text: 'Do the heavy lifting.' }]);
    try {
      const response = await fetch("https://m-o-a-z-3afreet-api.hf.space/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_summary: messages.map(m => `${m.sender}: ${m.text}`).join('\n') })
      });
      const data = await response.json();
      
      const extractedCampaign = data.campaign_report || data.campaign || data;
      setCampaignData(extractedCampaign);
      
      setMessages(prev => [...prev, { sender: '3afreet', text: 'The heavy lifting is done. Your calendar is live on the right.' }]);
    } catch (error) {
      console.error(error);
    }
    setIsGenerating(false);
  };

  return (
    <div className="pt-20 h-screen flex bg-noise">
      <div className="w-1/3 bg-surface border-r border-divider flex flex-col z-10">
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] p-4 text-sm leading-relaxed font-sans rounded-sm ${
                msg.sender === 'user' 
                  ? 'bg-rust text-paper' 
                  : 'bg-void border border-divider text-paper'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[90%] p-4 text-sm bg-void border border-divider text-muted rounded-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> 3afreet is plotting...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 border-t border-divider bg-surface flex gap-4">
          <button 
            onClick={generateIdeas} 
            disabled={isFetchingIdeas || isGenerating}
            className="flex-1 bg-void border border-divider hover:border-muted text-paper py-3 rounded-sm text-xs font-sans tracking-widest uppercase transition-colors flex justify-center items-center gap-2"
          >
            {isFetchingIdeas ? <Loader2 className="animate-spin w-4 h-4" /> : <Lightbulb className="w-4 h-4" />} IDEATE
          </button>
          <button 
            onClick={generateFullCampaign} 
            disabled={isGenerating || isFetchingIdeas}
            className="flex-1 bg-rust hover:bg-opacity-90 text-paper py-3 rounded-sm text-xs font-sans tracking-widest uppercase transition-colors flex justify-center items-center gap-2"
          >
            {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <CalendarDays className="w-4 h-4" />} PRODUCE
          </button>
        </div>

        <form onSubmit={handleSendMessage} className="p-6 pt-0 bg-surface">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              className="w-full pl-4 pr-12 py-4 bg-void text-paper border border-divider rounded-sm text-sm focus:outline-none focus:border-muted transition-colors font-sans placeholder-muted" 
              placeholder="Tell 3afreet about your client..." 
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 p-2 text-muted hover:text-rust disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <div className="w-2/3 bg-void bg-studio-grid p-12 overflow-y-auto">
        {!ideasData && !campaignData && (
          <div className="h-full flex items-center justify-center text-divider font-serif text-3xl italic">
            Ready to steal the show?
          </div>
        )}

        {ideasData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ideasData.map((idea, idx) => (
              <div key={idx} className="p-8 bg-surface border border-divider rounded-sm hover:border-muted transition-colors">
                <div className="text-xs text-rust font-sans tracking-widest mb-4 uppercase">Concept {idx + 1}</div>
                <h3 className="text-2xl font-serif text-paper mb-4">{idea.title}</h3>
                <p className="text-sm text-muted font-sans leading-relaxed mb-6 border-b border-divider pb-6">{idea.story}</p>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-paper uppercase tracking-wider block mb-2 flex items-center gap-2">
                      <Layers className="w-3 h-3 text-rust"/> Application
                    </span>
                    <p className="text-sm font-sans text-muted leading-relaxed">{idea.application}</p>
                  </div>
                  <div>
                    <span className="text-xs text-paper uppercase tracking-wider block mb-2 flex items-center gap-2">
                      <ImageIcon className="w-3 h-3 text-rust"/> Visuals
                    </span>
                    <p className="text-sm font-sans text-muted leading-relaxed">{idea.visuals}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {campaignData && (
          <div className="space-y-8">
            {Array.isArray(campaignData) ? campaignData.map((item, idx) => (
              <div key={idx} className="bg-surface border border-divider rounded-sm p-8 hover:border-muted transition-colors">
                <div className="flex justify-between items-center border-b border-divider pb-4 mb-6">
                  <h4 className="font-serif text-xl text-paper">{item.day}</h4>
                  <span className="bg-void border border-divider px-3 py-1 text-xs text-rust font-sans tracking-widest uppercase rounded-sm flex items-center gap-2">
                    {item.format}
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <span className="text-xs text-paper uppercase tracking-wider block mb-3">Copy & Script</span>
                    <pre className="text-sm font-sans text-muted whitespace-pre-wrap leading-relaxed font-inherit bg-void p-6 border border-divider rounded-sm">
                      {item.content}
                    </pre>
                  </div>
                  <div>
                    <span className="text-xs text-paper uppercase tracking-wider block mb-3">Midjourney Direction</span>
                    <p className="text-sm font-sans text-muted leading-relaxed bg-void p-6 border border-divider rounded-sm italic">
                      {item.prompt}
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 bg-surface border border-divider rounded-sm text-center">
                <p className="text-rust text-sm font-sans">Format Error: Expected an array of campaign days.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="min-h-screen bg-noise pt-32 pb-20 px-8 flex justify-center">
      <div className="max-w-3xl w-full">
        <header className="mb-16 border-b border-divider pb-8">
          <h1 className="text-5xl md:text-6xl font-serif text-paper mb-4">Moaz Hany</h1>
          <p className="text-sm font-sans tracking-widest text-rust uppercase">
            THE MIND BEHIND THE MAGIC
          </p>
        </header>

        <div className="font-sans text-muted leading-relaxed space-y-8 text-lg font-light">
          <p>
            I’m an AI engineer by degree, but a marketer by DNA. I live at the intersection of cold, hard code and killer brand storytelling. While I’m deep in my AI degree at Menoufia University, my mind is wired for what actually makes the market click. I don’t just write algorithms I train them to understand the brand and execute like elite marketers.
          </p>
          <p>
            I cut my teeth running fast paced event campaigns for NASA Space Apps and AI Entrepreneurship Club, then took that same hustle to real brands across Egypt and KSA. I don't do generic marketing fluff. I specialize in driving organic growth and building content pillars that actually move the needle.
          </p>
          <p>
            Enter 3afreet. I built it out of pure necessity. I needed an unseen mastermind to scale my campaigns without sacrificing the creative soul. It ditches the templates and cooks up deep, metaphor driven concepts. It’s the unfair advantage I always wanted. Now, it's yours.
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="dark">
      <Router>
        <nav className="fixed top-0 w-full p-6 px-8 flex justify-between items-center z-50 bg-void bg-opacity-90 backdrop-blur-sm border-b border-divider">
          <Link to="/" className="flex items-center gap-1.5 group">
            <img 
              src={myLogo} 
              alt="3afreet Logo" 
              className="w-11 h-11 -ml-1 transform group-hover:scale-105 transition-all duration-300" 
            />
            <span className="font-serif font-bold text-2xl tracking-tight text-paper mt-1">
              3afreet.
            </span>
          </Link>
          <div className="flex gap-8 font-sans text-xs uppercase tracking-widest text-muted">
            <Link to="/" className="hover:text-rust transition-colors">VISION</Link>
            <Link to="/studio" className="hover:text-rust transition-colors">WORKSPACE</Link>
            <Link to="/about" className="hover:text-rust transition-colors">ORIGIN</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;