import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface ResourceCounts {
  users: number;
  documents: number;
  conversations: number;
  messages: number;
}

interface RecentItem {
  id: string;
  name: string;
  type: 'user' | 'document' | 'conversation' | 'message';
}

const Dashboard: React.FC = () => {
  const [counts, setCounts] = useState<ResourceCounts | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [usersRes, documentsRes, conversationsRes, messagesRes] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/'),
          axios.get('/api/conversations'),
          axios.get('/api/messages'),
        ]);

        setCounts({
          users: usersRes.data.length,
          documents: documentsRes.data.length,
          conversations: conversationsRes.data.length,
          messages: messagesRes.data.length,
        });

        const recentItemsData: RecentItem[] = [
          ...usersRes.data.slice(0, 3).map((user: any) => ({ id: user.id, name: user.name, type: 'user' })),
          ...documentsRes.data.slice(0, 3).map((doc: any) => ({ id: doc.id, name: doc.title, type: 'document' })),
          ...conversationsRes.data.slice(0, 3).map((conv: any) => ({ id: conv.id, name: conv.title, type: 'conversation' })),
          ...messagesRes.data.slice(0, 3).map((msg: any) => ({ id: msg.id, name: msg.content, type: 'message' })),
        ];

        setRecentItems(recentItemsData);
      } catch (err: any) {
        setError('Failed to fetch dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && counts && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700">Users</h2>
              <p className="text-2xl font-bold text-gray-900">{counts.users}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700">Documents</h2>
              <p className="text-2xl font-bold text-gray-900">{counts.documents}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700">Conversations</h2>
              <p className="text-2xl font-bold text-gray-900">{counts.conversations}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700">Messages</h2>
              <p className="text-2xl font-bold text-gray-900">{counts.messages}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Recent Items</h2>
            <ul className="bg-white shadow rounded-lg divide-y divide-gray-200">
              {recentItems.map((item) => (
                <li key={item.id} className="p-4 flex justify-between items-center">
                  <span className="text-gray-700">{item.name}</span>
                  <Link
                    to={`/${item.type}/${item.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/users/new"
                className="bg-blue-600 text-white text-center py-4 rounded-lg shadow hover:bg-blue-700"
              >
                Add New User
              </Link>
              <Link
                to="/documents/new"
                className="bg-green-600 text-white text-center py-4 rounded-lg shadow hover:bg-green-700"
              >
                Upload Document
              </Link>
              <Link
                to="/conversations/new"
                className="bg-purple-600 text-white text-center py-4 rounded-lg shadow hover:bg-purple-700"
              >
                Start Conversation
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;