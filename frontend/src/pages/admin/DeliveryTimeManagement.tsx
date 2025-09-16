import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api/admin`;

const DeliveryTimeManagement: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    minDistance: '',
    maxDistance: '',
    minTime: '',
    maxTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/delivery-times`);
      const data = await res.json();
      setRules(data);
    } catch {
      toast('Error loading delivery time rules');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.minDistance || !form.maxDistance || !form.minTime || !form.maxTime) {
      toast('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE}/delivery-times/${editingId}` : `${API_BASE}/delivery-times`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          minDistance: Number(form.minDistance),
          maxDistance: Number(form.maxDistance),
          minTime: Number(form.minTime),
          maxTime: Number(form.maxTime)
        })
      });
      if (!res.ok) throw new Error('Failed to save');
      toast(editingId ? 'Updated!' : 'Created!');
      setForm({ title: '', minDistance: '', maxDistance: '', minTime: '', maxTime: '' });
      setEditingId(null);
      fetchRules();
    } catch {
      toast('Error saving delivery time rule');
    }
    setLoading(false);
  };

  const handleEdit = (rule: any) => {
    setForm({
      title: rule.title,
      minDistance: rule.minDistance.toString(),
      maxDistance: rule.maxDistance.toString(),
      minTime: rule.minTime.toString(),
      maxTime: rule.maxTime.toString()
    });
    setEditingId(rule._id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this rule?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/delivery-times/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast('Deleted!');
      fetchRules();
    } catch {
      toast('Error deleting rule');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Delivery Time Management</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col gap-3">
        <Input name="title" value={form.title} onChange={handleChange} placeholder="Title (e.g. Delivery time for 1 km)" />
        <div className="flex gap-2">
          <Input name="minDistance" value={form.minDistance} onChange={handleChange} placeholder="Min Distance (km)" type="number" min={0} />
          <Input name="maxDistance" value={form.maxDistance} onChange={handleChange} placeholder="Max Distance (km)" type="number" min={0} />
        </div>
        <div className="flex gap-2">
          <Input name="minTime" value={form.minTime} onChange={handleChange} placeholder="Min Time (min)" type="number" min={0} />
          <Input name="maxTime" value={form.maxTime} onChange={handleChange} placeholder="Max Time (min)" type="number" min={0} />
        </div>
        <Button type="submit" disabled={loading}>{editingId ? 'Update' : 'Create'}</Button>
        {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm({ title: '', minDistance: '', maxDistance: '', minTime: '', maxTime: '' }); }}>Cancel Edit</Button>}
      </form>
      <h3 className="text-lg font-semibold mb-2">Existing Delivery Time Rules</h3>
      {loading ? <div>Loading...</div> : (
        <ul className="space-y-3">
          {rules.map(rule => (
            <li key={rule._id} className="bg-gray-50 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border">
              <div>
                <div className="font-bold text-base">{rule.title}</div>
                <div className="text-sm text-gray-700">Distance: {rule.minDistance} - {rule.maxDistance} km</div>
                <div className="text-sm text-gray-700">Time: {rule.minTime} - {rule.maxTime} min</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEdit(rule)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(rule._id)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DeliveryTimeManagement;
