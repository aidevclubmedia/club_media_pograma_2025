import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MessageCircle, Loader2, Send } from 'lucide-react';
import { usePlanogram } from '../../context/PlanogramContext';
import ReactMarkdown from 'react-markdown';

const genAI = new GoogleGenerativeAI('AIzaSyC-_vywH9uWbGFw3zyyXfOijA3i1DZElRY');

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ShelfAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { state } = usePlanogram();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateShelfSuggestions = async (prompt: string) => {
    try {
      setIsLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Prepare context about the current shelf state
      const shelfContext = {
        products: state.productCatalog,
        currentShelf: state.doors
          .flatMap(d => d.equipment)
          .flatMap(e => e.bays)
          .flatMap(b => b.shelves)
          .find(s => s.id === state.selectedShelfId)
      };

      const fullPrompt = `
        As a retail shelf optimization expert with 10 years of experience, help organize products based on this context:
        
        Current shelf state:
        ${JSON.stringify(shelfContext, null, 2)}

        User question: ${prompt}

        Provide specific recommendations for product placement, considering:
        1. Product dimensions and weights
        2. Space utilization
        3. Visual merchandising principles
        4. Category management
        
        Format your response using markdown with:
        - Clear sections with headings (##)
        - Bulleted lists where appropriate
        - Bold text for emphasis
        - Tables for structured data
        - Horizontal rules to separate sections
        
        Start directly with the content (no introductory phrases).
        Keep the tone professional but conversational.
      `;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, 
        { role: 'user', content: prompt },
        { role: 'assistant', content: text }
      ]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev,
        { role: 'user', content: prompt },
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    generateShelfSuggestions(input);
  };

  const PIXELS_PER_CM = 6;
  const width = 100 * PIXELS_PER_CM; // 100cm
  const height = 100 * PIXELS_PER_CM; // 100cm - Updated to 100cm

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors duration-200"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 bg-gray-900 rounded-lg shadow-xl border border-gray-800 flex flex-col"
          style={{ 
            width: `${width}px`,
            height: `${height}px`,
            maxHeight: 'calc(100vh - 120px)' // Prevent overflow beyond viewport
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle size={20} className="text-blue-400" />
              <h3 className="font-medium">POGrama Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              ×
            </button>
          </div>

          {/* Messages Container */}
          <div 
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            style={{ 
              height: `${height - 120}px`, // Subtract header and input heights
              scrollbarWidth: 'thin',
              scrollbarColor: '#4B5563 transparent'
            }}
          >
            <div className="p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                  <MessageCircle size={32} className="mb-4 opacity-50" />
                  <p className="text-center text-sm max-w-xs">
                    Ask me about shelf organization, product placement, or optimization suggestions.
                  </p>
                  <div className="mt-4 space-y-2 text-sm w-full">
                    <p className="text-gray-500 text-center">Example questions:</p>
                    <button 
                      onClick={() => generateShelfSuggestions("How should I organize beverages by size?")}
                      className="block w-full text-left px-4 py-2 rounded bg-gray-800 hover:bg-gray-750 transition"
                    >
                      How should I organize beverages by size?
                    </button>
                    <button
                      onClick={() => generateShelfSuggestions("What's the optimal product placement for this shelf?")}
                      className="block w-full text-left px-4 py-2 rounded bg-gray-800 hover:bg-gray-750 transition"
                    >
                      What's the optimal product placement?
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-200'
                      } shadow-md`}
                    >
                      {msg.role === 'user' ? (
                        <p>{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Form */}
          <div className="p-4 border-t border-gray-800 bg-gray-900 rounded-b-lg">
            <form 
              onSubmit={handleSubmit} 
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for shelf organization help..."
                className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 placeholder-gray-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center w-10 h-10"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelfAssistant;