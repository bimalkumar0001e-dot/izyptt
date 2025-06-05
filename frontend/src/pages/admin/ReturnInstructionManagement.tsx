import React, { useEffect, useState } from 'react';
import { Eye, Edit, ToggleRight, ToggleLeft, Trash } from 'lucide-react';
import { BACKEND_URL } from '@/utils/utils';

interface ReturnInstruction {
  _id: string;
  title: string;
  content: string;
  isActive: boolean;
}

const API_URL = `${BACKEND_URL}/api/admin/return-instructions`;

const ReturnInstructionManagement: React.FC = () => {
  const [instructions, setInstructions] = useState<ReturnInstruction[]>([]);
  const [loading, setLoading] = useState(true);

  // For modal/dialog
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{ title: string; content: string; isActive: boolean }>({
    title: '',
    content: '',
    isActive: true,
  });
  const [editId, setEditId] = useState<string | null>(null);

  // Modal state for viewing details
  const [viewModal, setViewModal] = useState<{ open: boolean; instruction: ReturnInstruction | null }>({
    open: false,
    instruction: null,
  });

  const fetchInstructions = () => {
    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setInstructions(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInstructions();
  }, []);

  // Add or Edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/${editId}` : API_URL;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setShowForm(false);
    setEditId(null);
    setFormData({ title: '', content: '', isActive: true });
    fetchInstructions();
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this return instruction?')) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchInstructions();
  };

  // Toggle Active
  const handleToggleActive = async (id: string) => {
    await fetch(`${API_URL}/${id}/activate`, { method: 'PATCH' });
    fetchInstructions();
  };

  // View
  const handleView = (instr: ReturnInstruction) => {
    setViewModal({ open: true, instruction: instr });
  };

  // Edit
  const handleEdit = (instr: ReturnInstruction) => {
    setEditId(instr._id);
    setFormData({ title: instr.title, content: instr.content, isActive: instr.isActive });
    setShowForm(true);
  };

  // Add new
  const handleAddNew = () => {
    setEditId(null);
    setFormData({ title: '', content: '', isActive: true });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Return Instructions</h2>
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold"
          onClick={handleAddNew}
        >
          + Add New Return Instruction
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleFormSubmit} className="mb-6 bg-gray-50 p-4 rounded shadow">
          <div className="mb-2">
            <label className="block font-medium mb-1">Title</label>
            <input
              className="border px-2 py-1 rounded w-full"
              value={formData.title}
              onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="mb-2">
            <label className="block font-medium mb-1">Content</label>
            <textarea
              className="border px-2 py-1 rounded w-full"
              value={formData.content}
              onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
              required
            />
          </div>
          <div className="mb-2 flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={e => setFormData(f => ({ ...f, isActive: e.target.checked }))}
              id="isActive"
            />
            <label htmlFor="isActive" className="ml-2">Active</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
              {editId ? 'Update' : 'Add'}
            </button>
            <button type="button" className="bg-gray-300 px-4 py-1 rounded" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {/* View Modal */}
      {viewModal.open && viewModal.instruction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setViewModal({ open: false, instruction: null })}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-2">Return Instruction Details</h2>
            <div className="space-y-2">
              <div>
                <b>Title:</b> {viewModal.instruction.title}
              </div>
              <div>
                <b>Content:</b>
                <div className="whitespace-pre-line border rounded p-2 mt-1 bg-gray-50">{viewModal.instruction.content}</div>
              </div>
              <div>
                <b>Status:</b>{' '}
                <span className={`px-2 py-1 rounded text-xs font-semibold ${viewModal.instruction.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {viewModal.instruction.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-200 px-4 py-1 rounded"
                onClick={() => setViewModal({ open: false, instruction: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 text-left">Title</th>
                <th className="py-2 px-3 text-left">Content</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instructions.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4">No return instructions found.</td>
                </tr>
              )}
              {instructions.map(instr => (
                <tr key={instr._id} className="border-t">
                  <td className="py-2 px-3 font-semibold">{instr.title}</td>
                  <td className="py-2 px-3">{instr.content}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${instr.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {instr.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2 px-3 flex gap-2">
                    <button
                      title="View"
                      onClick={() => handleView(instr)}
                      className="text-gray-700 hover:text-blue-600"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      title="Edit"
                      onClick={() => handleEdit(instr)}
                      className="text-gray-700 hover:text-green-600"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      title={instr.isActive ? "Deactivate" : "Activate"}
                      onClick={() => handleToggleActive(instr._id)}
                      className={instr.isActive ? "text-green-600 hover:text-yellow-600" : "text-gray-400 hover:text-green-600"}
                    >
                      {instr.isActive ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      title="Delete"
                      onClick={() => handleDelete(instr._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReturnInstructionManagement;
