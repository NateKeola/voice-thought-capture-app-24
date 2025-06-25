
import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, X } from 'lucide-react';
import { useMemos } from '@/contexts/MemoContext';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface MemoAIChatProps {
  onClose: () => void;
}

const MemoAIChat: React.FC<MemoAIChatProps> = ({ onClose }) => {
  const { memos } = useMemos();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: "Hi! Ask me anything about your memos. Try: 'What tasks do I have?' or 'Who did I mention recently?'",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const queryMemoAI = async (question: string) => {
    const memoData = memos.map(m => 
      `${m.type}: ${m.text} ${m.title ? `(Title: ${m.title})` : ''} (${new Date(m.createdAt).toLocaleDateString()})`
    ).join('\n');
    
    const prompt = `Based on these user memos, answer the question conversationally:

MEMOS:
${memoData}

QUESTION: ${question}

Respond naturally and reference specific memos when relevant. If you can't find relevant info, say so. Keep responses concise and helpful.`;

    try {
      // This is a placeholder for the AI service - you'll need to implement the actual API call
      // For now, we'll provide a basic response based on memo content
      const response = await simulateAIResponse(question, memos);
      return response;
    } catch (error) {
      return "Sorry, I'm having trouble accessing your memos right now.";
    }
  };

  // Simulate AI response for now - replace with actual AI service
  const simulateAIResponse = async (question: string, userMemos: any[]) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('task') || lowerQuestion.includes('todo')) {
      const tasks = userMemos.filter(m => m.type === 'task');
      return `You have ${tasks.length} tasks. ${tasks.slice(0, 3).map(t => `• ${t.title || t.text.substring(0, 50)}`).join('\n')}`;
    }
    
    if (lowerQuestion.includes('note') || lowerQuestion.includes('idea')) {
      const notes = userMemos.filter(m => m.type === 'note' || m.type === 'idea');
      return `You have ${notes.length} notes/ideas. Recent ones include: ${notes.slice(0, 2).map(n => `• ${n.title || n.text.substring(0, 50)}`).join('\n')}`;
    }
    
    if (lowerQuestion.includes('recent') || lowerQuestion.includes('latest')) {
      const recent = userMemos.slice(0, 3);
      return `Your recent memos: ${recent.map(m => `• ${m.type}: ${m.title || m.text.substring(0, 40)}`).join('\n')}`;
    }
    
    return `I found ${userMemos.length} memos total. You can ask me about specific tasks, notes, or recent activity!`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    const aiResponse = await queryMemoAI(currentInput);
    
    const aiMessage: Message = {
      id: Date.now() + 1,
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md h-5/6 flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Memo AI</h3>
              <p className="text-xs text-gray-500">{memos.length} memos</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-xl max-w-xs ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about your memos..."
              className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {/* Quick Questions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {['What tasks are pending?', 'Who did I mention?', 'Recent ideas?'].map((question) => (
              <button
                key={question}
                onClick={() => handleQuickQuestion(question)}
                className="text-xs px-3 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoAIChat;
