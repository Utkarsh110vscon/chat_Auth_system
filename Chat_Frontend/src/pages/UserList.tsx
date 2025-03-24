
import { useNavigate } from 'react-router-dom';
import { Home, Search, MessageSquare } from 'lucide-react';

// Mock data for friends list
const friends = [
  {
    id: 1,
    name: 'John Doe',
    avatar: 'JD',
    lastMessage: 'Hey, how are you?',
    time: '10:30 AM',
    status: 'online',
    hasChat: true
  },
  {
    id: 2,
    name: 'Sarah Smith',
    avatar: 'SS',
    lastMessage: null,
    time: null,
    status: 'offline',
    hasChat: false
  },
  {
    id: 3,
    name: 'Mike Johnson',
    avatar: 'MJ',
    lastMessage: 'Thanks for your help!',
    time: 'Yesterday',
    status: 'online',
    hasChat: true
  },
  {
    id: 4,
    name: 'Emma Wilson',
    avatar: 'EW',
    lastMessage: null,
    time: null,
    status: 'online',
    hasChat: false
  }
];

function UserList() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white shadow-lg">
        {/* Header */}
        <div className="border-b p-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Home size={24} />
          </button>
          <h1 className="text-xl font-semibold">Friends</h1>
          <button
            onClick={() => navigate('/search')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Search size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search friends..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        {/* Friends List */}
        <div className="divide-y">
          {friends.map(friend => (
            <div
              key={friend.id}
              onClick={() => navigate(`/chat/${friend.id}`)}
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {friend.avatar}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{friend.name}</h3>
                  {friend.time && <span className="text-sm text-gray-500">{friend.time}</span>}
                </div>
                {friend.hasChat ? (
                  <p className="text-sm text-gray-600 truncate">{friend.lastMessage}</p>
                ) : (
                  <div className="flex items-center space-x-1 text-sm text-indigo-600">
                    <MessageSquare size={16} />
                    <span>Start chatting</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserList;