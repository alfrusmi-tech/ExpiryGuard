
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Product } from '../../types';

import {
  stockMovementService,
  type MovementType
} from '../../services/stockMovementService';

interface Props {
  batch: Product;
  onClose: () => void;
  onSaved: () => void;
}

export function StockMovementDialog({
  batch,
  onClose,
  onSaved
}: Props) {

  const [type, setType] =
    useState<MovementType>('RECEIVED');

  const [quantity, setQuantity] = useState('1');
  const [note, setNote] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError('');

    const amount = Number(quantity);

    if (!Number.isInteger(amount) || amount <= 0) {
      setError('Enter a positive whole-number quantity');
      return;
    }

    if (type !== 'RECEIVED' &&
        amount > batch.quantity) {
      setError('Insufficient stock in this batch');
      return;
    }

    if (type === 'SOLD' && batch.status === 'expired') {
      setError('Expired medicines cannot be sold');
      return;
    }

    setSaving(true);

    try {
      await stockMovementService.record(
        batch.id,
        type,
        amount,
        note
      );

      onSaved();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update stock'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50
      flex items-center justify-center p-4">

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-dialog-title"
        className="bg-white rounded-xl shadow-xl
          w-full max-w-md p-6"
      >
        <h2
          id="stock-dialog-title"
          className="text-xl font-bold mb-2"
        >
          Manage Stock
        </h2>

        <p className="text-sm text-slate-600 mb-4">
          {batch.name}
          <br />
          Batch: {batch.batchNumber}
          <br />
          Current quantity: {batch.quantity}
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="movement-type"
              className="block text-sm font-medium mb-1"
            >
              Action
            </label>

            <select
              id="movement-type"
              value={type}
              onChange={e =>
                setType(e.target.value as MovementType)
              }
              className="w-full border rounded-lg p-2"
              disabled={saving}
            >
              <option value="RECEIVED">
                Receive Stock
              </option>
              <option value="SOLD">
                Sell Stock
              </option>
              <option value="DISPOSED">
                Dispose Stock
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="movement-quantity"
              className="block text-sm font-medium mb-1"
            >
              Quantity
            </label>

            <input
              id="movement-quantity"
              type="number"
              min="1"
              max={
                type === 'RECEIVED'
                  ? undefined
                  : batch.quantity
              }
              step="1"
              required
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              disabled={saving}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label
              htmlFor="movement-note"
              className="block text-sm font-medium mb-1"
            >
              Note (optional)
            </label>

            <textarea
              id="movement-note"
              value={note}
              maxLength={200}
              onChange={e => setNote(e.target.value)}
              disabled={saving}
              placeholder="Reason for the stock movement"
              className="w-full border rounded-lg p-2"
              rows={3}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="border rounded-lg px-4 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 text-white
                rounded-lg px-4 py-2
                disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
