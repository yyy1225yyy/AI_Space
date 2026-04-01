import { createRoot } from 'react-dom/client';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let toastContainer: HTMLDivElement | null = null;
let toastRoot: ReturnType<typeof createRoot> | null = null;
let toasts: ToastItem[] = [];
let nextId = 0;

function getContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
    toastRoot = createRoot(toastContainer);
  }
  return toastRoot!;
}

function renderToasts() {
  const root = getContainer();
  root.render(
    <>
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </>
  );
}

function show(message: string, type: ToastType = 'info', duration = 3000) {
  const id = nextId++;
  toasts = [...toasts, { id, message, type }];
  renderToasts();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    renderToasts();
  }, duration);
}

export const toast = {
  success: (msg: string) => show(msg, 'success'),
  error: (msg: string) => show(msg, 'error'),
  info: (msg: string) => show(msg, 'info'),
};
