import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabaseIntegrations, deleteDatabaseIntegration } from '../api/client';

interface DatabaseIntegration {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  username: string;
  createdAt: string;
}

const DatabaseIntegrationList: React.FC = () => {
  const [items, setItems] = useState<DatabaseIntegration[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getDatabaseIntegrations();
        setItems(response);
      } catch (err) {
        setError('Failed to fetch database integrations.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDatabaseIntegration(id);
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (err) {
      setError('Failed to delete database integration.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Database Integrations</h1>
        <button
          onClick={() => navigate('/database-integration/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New
        </button>
      </div>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded w-full"
      />
      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Type</th>
            <th className="border border-gray-300 px-4 py-2">Host</th>
            <th className="border border-gray-300 px-4 py-2">Port</th>
            <th className="border border-gray-300 px-4 py-2">Username</th>
            <th className="border border-gray-300 px-4 py-2">Created At</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item.id}>
              <td className="border border-gray-300 px-4 py-2">{item.name}</td>
              <td className="border border-gray-300 px-4 py-2">{item.type}</td>
              <td className="border border-gray-300 px-4 py-2">{item.host}</td>
              <td className="border border-gray-300 px-4 py-2">{item.port}</td>
              <td className="border border-gray-300 px-4 py-2">{item.username}</td>
              <td className="border border-gray-300 px-4 py-2">{item.createdAt}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DatabaseIntegrationList;