import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabaseIntegration, createDatabaseIntegration, updateDatabaseIntegration } from '../api/client';

interface DatabaseIntegrationFormValues {
  name: string;
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
}

const DatabaseIntegrationForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<DatabaseIntegrationFormValues>({
    name: '',
    type: '',
    host: '',
    port: 0,
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await getDatabaseIntegration(id);
          setFormValues({
            name: response.name,
            type: response.type,
            host: response.host,
            port: response.port,
            username: response.username,
            password: '', // Password is not returned for security reasons
          });
        } catch (err) {
          setError('Failed to fetch database integration details.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: name === 'port' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (id) {
        await updateDatabaseIntegration(id, formValues);
      } else {
        await createDatabaseIntegration(formValues);
      }
      navigate('/database-integration');
    } catch (err) {
      setError('Failed to save database integration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Edit Database Integration' : 'New Database Integration'}</h1>
      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <input
            type="text"
            name="type"
            value={formValues.type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Host</label>
          <input
            type="text"
            name="host"
            value={formValues.host}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Port</label>
          <input
            type="number"
            name="port"
            value={formValues.port}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formValues.username}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formValues.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required={!id}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default DatabaseIntegrationForm;