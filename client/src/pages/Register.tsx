import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, UserPlus } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card, CardContent } from '../components/common/Card';
import { authService } from '../services/authService';

const EMPTY = { name: '', username: '', email: '', password: '' };

export function Register() {
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof EMPTY) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!/^[a-zA-Z0-9._-]{3,50}$/.test(form.username.trim())) {
      setError('Username must be 3-50 characters: letters, numbers, . _ -');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (new TextEncoder().encode(form.password).length > 72) {
      setError('Password is too long (maximum 72 bytes).');
      return;
    }
    if (form.password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await authService.register({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password
      });
      setSuccess(result.message);
      setForm(EMPTY);
      setConfirm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link to="/" className="flex items-center space-x-3 mb-6 group">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">ExpiryGuard</span>
        </Link>
        <h2 className="text-center text-2xl font-bold text-slate-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg border-slate-200/80">
          <CardContent className="px-4 py-8 sm:px-10">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input label="Full name" name="name" required maxLength={100}
                autoComplete="name" value={form.name} onChange={set('name')} />
              <Input label="Username" name="username" required maxLength={50}
                autoComplete="username" value={form.username} onChange={set('username')} />
              <Input label="Email address" name="email" type="email" required maxLength={254}
                autoComplete="email" value={form.email} onChange={set('email')} />
              <Input label="Password (min 8 characters)" name="password" type="password" required
                autoComplete="new-password" value={form.password} onChange={set('password')} />
              <Input label="Confirm password" name="confirm" type="password" required
                autoComplete="new-password" value={confirm}
                onChange={e => setConfirm(e.target.value)} />

              {error && (
                <div role="alert" className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-sm text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full text-base py-2.5 font-semibold" disabled={submitting}>
                <UserPlus className="w-5 h-5 mr-2" />
                {submitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}