import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { apiRequest } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card, CardContent } from '../components/common/Card';

type Role = 'ADMIN' | 'PHARMACIST';

interface UserRow {
  id: number;
  username: string;
  email: string;
  name: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
}

const EMPTY = {
  name: '', username: '', email: '', password: '', role: 'PHARMACIST' as Role
};

export function Users() {
  const { user: me } = useAuth();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await apiRequest<UserRow[]>('/users'));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const update = async (id: number, body: { role?: Role; enabled?: boolean }) => {
    setError('');
    try {
      await apiRequest(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed.');
    }
  };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setForm(EMPTY);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create user.');
    } finally {
      setSaving(false);
    }
  };

  const pending = rows.filter(r => !r.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">
            Approve new sign-ups and manage roles.
            {pending > 0 && (
              <span className="ml-2 font-medium text-amber-700">
                {pending} waiting for approval
              </span>
            )}
          </p>
        </div>
        <Button type="button" onClick={() => setShowForm(s => !s)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {error && (
        <div role="alert" className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full name" required maxLength={100} value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input label="Username" required maxLength={50} value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })} />
              <Input label="Email" type="email" required maxLength={254} value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input label="Password (min 8)" type="password" required minLength={8}
                autoComplete="new-password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as Role })}
                >
                  <option value="PHARMACIST">PHARMACIST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex items-end justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Create user'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-6 text-slate-500">Loading users...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(u => {
                  const isSelf = String(u.id) === me?.id;
                  return (
                    <tr key={u.id} className="border-t border-slate-100">
                      <td className="p-3">
                        {u.name}
                        <span className="text-slate-400"> ({u.username})</span>
                      </td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">
                        <select
                          disabled={isSelf}
                          className="rounded-md border border-slate-300 bg-white px-2 py-1"
                          value={u.role}
                          onChange={e => void update(u.id, { role: e.target.value as Role })}
                        >
                          <option value="PHARMACIST">PHARMACIST</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span className={u.enabled ? 'text-emerald-700' : 'text-amber-700 font-medium'}>
                          {u.enabled ? 'Active' : 'Pending / Disabled'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSelf}
                          onClick={() => void update(u.id, { enabled: !u.enabled })}
                        >
                          {u.enabled ? 'Disable' : 'Approve'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}