import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowLeft, UserPlus, Mail, Check, Clock } from 'lucide-react';

// Mock data for demonstration
const allUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'JD',
    status: 'online',
    friendStatus: 'none'
  },
  {
    id: 2,
    name: 'Sarah Smith',
    email: 'sarah.smith@example.com',
    avatar: 'SS',
    status: 'offline',
    friendStatus: 'pending'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.j@example.com',
    avatar: 'MJ',
    status: 'online',
    friendStatus: 'accepted'
  }
];

function Search() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState<typeof allUsers[0] | null>(null);
  const [friendRequests, setFriendRequests] = useState<number[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = allUsers.find(user => 
      user.email.toLowerCase() === email.toLowerCase()
    );
    setSearchResult(foundUser || null);
    setSearchPerformed(true);
  };

  const handleConnect = (userId: number) => {
    setFriendRequests([...friendRequests, userId]);
  };

  const getFriendActionButton = (user: typeof allUsers[0]) => {
    if (user.friendStatus === 'accepted') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/chat/${user.id}`);
          }}
          className="flex items-center space-x-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg"
        >
          <Check size={16} />
          <span className="text-sm font-medium">Friends</span>
        </button>
      );
    }

    if (user.friendStatus === 'pending' || friendRequests.includes(user.id)) {
      return (
        <button
          className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg cursor-not-allowed"
        >
          <Clock size={16} />
          <span className="text-sm font-medium">Request Pending</span>
        </button>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleConnect(user.id);
        }}
        className="flex items-center space-x-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
      >
        <UserPlus size={16} />
        <span className="text-sm font-medium">Add Friend</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white shadow-lg">
        {/* Header */}
        <div className="border-b p-4 flex justify-between items-center bg-white">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold">Find Friends</h1>
          <div className="w-10"></div>
        </div>

        {/* Search Form */}
        <div className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Find friend by email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50"
                  required
                />
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
            >
              <SearchIcon size={20} />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Search Result */}
        {searchPerformed && (
          <div className="border-t">
            {searchResult ? (
              <div className="p-6">
                <div className="bg-white rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {searchResult.avatar}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          searchResult.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{searchResult.name}</h3>
                        <p className="text-sm text-gray-500">{searchResult.email}</p>
                      </div>
                    </div>
                    {getFriendActionButton(searchResult)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No user found with this email address</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;