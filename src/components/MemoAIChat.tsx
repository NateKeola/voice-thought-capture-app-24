import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, X } from 'lucide-react';
import { useMemos } from '@/contexts/MemoContext';
import { extractMemoMetadata } from '@/utils/memoMetadata';

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
      content: `Hi! I can help you search through your ${memos.length} memos. Try asking: "What am I doing tomorrow?" or "Do I have any volleyball plans?"`,
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
    if (!memos || memos.length === 0) {
      return "I don't have access to any memos yet. Please create some memos first and then ask me questions about them.";
    }

    // Prepare memo data with cleaned content and proper titles
    const memoData = memos.map(memo => {
      const metadata = extractMemoMetadata(memo.text || '');
      const content = metadata.cleanText;
      const date = memo.createdAt;
      const type = memo.type || 'note';
      const title = memo.title || 'Untitled';
      
      let contextInfo = '';
      if (metadata.contacts.length > 0) {
        contextInfo += ' [mentions people]';
      }
      
      return `[${type.toUpperCase()}] ${title}: ${content}${contextInfo} (Created: ${new Date(date).toLocaleDateString()})`;
    }).join('\n\n');

    const prompt = `You are a personal assistant analyzing someone's voice memos and notes. Answer their question based on the memo content below.

USER QUESTION: "${question}"

MEMOS:
${memoData}

Instructions:
- Answer naturally and conversationally
- Reference specific memos when relevant
- If you find relevant information, mention what you found
- If no relevant memos exist, say so clearly
- Pay attention to dates and time references (like "tomorrow", "evening", etc.)
- Be specific about what activities or plans you find
- Keep responses concise and helpful

Answer:`;

    try {
      // For now, we'll simulate the AI response with a simple search
      const response = await simulateAIResponse(question, memos);
      return response;
    } catch (error) {
      console.error('Error querying AI:', error);
      return "Sorry, I'm having trouble accessing your memos right now.";
    }
  };

  // Simulate AI response for now - replace with actual AI service when API key is available
  const simulateAIResponse = async (question: string, userMemos: any[]) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('task') || lowerQuestion.includes('todo') || lowerQuestion.includes('pending')) {
      const tasks = userMemos.filter(m => m.type === 'task');
      if (tasks.length === 0) {
        return "You don't have any tasks in your memos.";
      }
      return `You have ${tasks.length} tasks:\n${tasks.slice(0, 5).map(t => {
        const metadata = extractMemoMetadata(t.text || '');
        return `• ${t.title || metadata.cleanText.substring(0, 50)}`;
      }).join('\n')}`;
    }
    
    if (lowerQuestion.includes('note') || lowerQuestion.includes('idea')) {
      const notes = userMemos.filter(m => m.type === 'note' || m.type === 'idea');
      if (notes.length === 0) {
        return "You don't have any notes or ideas in your memos.";
      }
      return `You have ${notes.length} notes/ideas:\n${notes.slice(0, 3).map(n => {
        const metadata = extractMemoMetadata(n.text || '');
        return `• ${n.title || metadata.cleanText.substring(0, 50)}`;
      }).join('\n')}`;
    }
    
    if (lowerQuestion.includes('recent') || lowerQuestion.includes('latest')) {
      const recent = userMemos.slice(0, 3);
      return `Your recent memos:\n${recent.map(m => {
        const metadata = extractMemoMetadata(m.text || '');
        return `• ${m.type}: ${m.title || metadata.cleanText.substring(0, 40)}`;
      }).join('\n')}`;
    }

    if (lowerQuestion.includes('tomorrow') || lowerQuestion.includes('today') || lowerQuestion.includes('volleyball') || lowerQuestion.includes('plan')) {
      const relevantMemos = userMemos.filter(m => {
        const metadata = extractMemoMetadata(m.text || '');
        const text = metadata.cleanText.toLowerCase();
        const title = (m.title || '').toLowerCase();
        return text.includes('tomorrow') || text.includes('today') || text.includes('volleyball') || text.includes('plan') ||
               title.includes('tomorrow') || title.includes('today') || title.includes('volleyball') || title.includes('plan');
      });
      
      if (relevantMemos.length === 0) {
        return "I couldn't find any memos about plans, volleyball, or activities for today/tomorrow.";
      }
      
      return `I found ${relevantMemos.length} relevant memo(s):\n${relevantMemos.map(m => {
        const metadata = extractMemoMetadata(m.text || '');
        return `• ${m.title || metadata.cleanText.substring(0, 60)}`;
      }).join('\n')}`;
    }
    
    // General search through memo content
    const searchTerms = question.toLowerCase().split(' ').filter(word => word.length > 2);
    const matchingMemos = userMemos.filter(m => {
      const metadata = extractMemoMetadata(m.text || '');
      const memoText = metadata.cleanText.toLowerCase() + ' ' + (m.title || '').toLowerCase();
      return searchTerms.some(term => memoText.includes(term));
    });

    if (matchingMemos.length === 0) {
      return `I couldn't find any memos related to "${question}". You have ${userMemos.length} total memos. Try asking about tasks, notes, or recent activity!`;
    }

    return `I found ${matchingMemos.length} memo(s) related to your question:\n${matchingMemos.slice(0, 3).map(m => {
      const metadata = extractMemoMetadata(m.text || '');
      return `• ${m.title || metadata.cleanText.substring(0, 60)}`;
    }).join('\n')}`;
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
            {[
              'What am I doing tomorrow?', 
              'Any volleyball plans?', 
              'What tasks are pending?',
              'Recent ideas?'
            ].map((question) => (
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
