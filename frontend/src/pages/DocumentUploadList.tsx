import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, deleteDocument } from '../api/client';

interface Document {
  id: string;
  title: string;
  description: string;
  metadata: string;
  createdAt: string;
  updatedAt: string;
}

const DocumentUploadList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getDocuments();
        setDocuments(response);
      } catch (err) {
        setError('Failed to fetch documents.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      setError('Failed to delete document.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Document Uploads</h1>
        <button
          onClick={() => navigate('/document-upload/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full"
        />
      </div>
      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Title</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
            <th className="border border-gray-300 px-4 py-2">Metadata</th>
            <th className="border border-gray-300 px-4 py-2">Created At</th>
            <th className="border border-gray-300 px-4 py-2">Updated At</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDocuments.map((doc) => (
            <tr key={doc.id}>
              <td className="border border-gray-300 px-4 py-2">{doc.id}</td>
              <td className="border border-gray-300 px-4 py-2">{doc.title}</td>
              <td className="border border-gray-300 px-4 py-2">{doc.description}</td>
              <td className="border border-gray-300 px-4 py-2">{doc.metadata}</td>
              <td className="border border-gray-300 px-4 py-2">{doc.createdAt}</td>
              <td className="border border-gray-300 px-4 py-2">{doc.updatedAt}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  onClick={() => navigate(`/document-upload/${doc.id}`)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
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

export default DocumentUploadList;