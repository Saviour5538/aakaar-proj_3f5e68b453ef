import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDocument, uploadDocument, updateDocument } from '../api/client';

interface DocumentFormState {
  title: string;
  description: string;
  metadata: string;
}

const DocumentProcessingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formState, setFormState] = useState<DocumentFormState>({
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
          const response = await getDocument(id);
          setFormState({
            title: response.title,
            description: response.description,
            metadata: response.metadata,
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
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (id) {
        await updateDocument(id, formState);
      } else {
        await uploadDocument(formState);
      }
      navigate('/document-processing');
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
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formState.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formState.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="metadata" className="block font-medium mb-1">
            Metadata
          </label>
          <input
            type="text"
            id="metadata"
            name="metadata"
            value={formState.metadata}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/document-processing')}
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

export default DocumentProcessingForm;