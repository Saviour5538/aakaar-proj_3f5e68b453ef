import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocument, uploadDocument, updateDocument } from '../api/client';

interface DocumentFormValues {
  title: string;
  description: string;
  metadata: string;
}

const DocumentUploadForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formValues, setFormValues] = useState<DocumentFormValues>({
    title: '',
    description: '',
    metadata: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchDocument = async () => {
        setLoading(true);
        setError(null);
        try {
          const document = await getDocument(id);
          setFormValues({
            title: document.title,
            description: document.description,
            metadata: document.metadata,
          });
        } catch (err) {
          setError('Failed to fetch document.');
        } finally {
          setLoading(false);
        }
      };

      fetchDocument();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (id) {
        await updateDocument(id, formValues);
      } else {
        await uploadDocument(formValues);
      }
      navigate('/document-upload');
    } catch (err) {
      setError('Failed to save document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Edit Document' : 'New Document'}</h1>
      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formValues.title}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-4 py-2 w-full"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formValues.description}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-4 py-2 w-full"
          />
        </div>
        <div>
          <label htmlFor="metadata" className="block text-sm font-medium text-gray-700">
            Metadata
          </label>
          <input
            type="text"
            id="metadata"
            name="metadata"
            value={formValues.metadata}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-4 py-2 w-full"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/document-upload')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
          >
            Cancel
          </button>
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

export default DocumentUploadForm;