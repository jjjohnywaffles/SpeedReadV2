interface CredentialResponse {
  credential: string;
}

interface PromptMomentNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  prompt: (listener?: (notification: PromptMomentNotification) => void) => void;
  cancel: () => void;
}

interface GoogleGlobal {
  accounts: {
    id: GoogleAccountsId;
  };
}

declare global {
  interface Window {
    google?: GoogleGlobal;
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

let initialized = false;
let pending: {
  resolve: (token: string) => void;
  reject: (err: Error) => void;
} | null = null;

function ensureInitialized(): boolean {
  if (initialized) return true;
  if (!window.google?.accounts?.id) return false;
  window.google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: (response) => {
      const p = pending;
      pending = null;
      if (p) {
        if (response?.credential) p.resolve(response.credential);
        else p.reject(new Error('No credential returned'));
      }
    },
    auto_select: true,
    use_fedcm_for_prompt: true,
  });
  initialized = true;
  return true;
}

export function silentRefresh(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ensureInitialized()) {
      reject(new Error('Google Identity Services not loaded'));
      return;
    }
    if (pending) {
      reject(new Error('Refresh already in progress'));
      return;
    }
    pending = { resolve, reject };

    const timeout = setTimeout(() => {
      if (pending) {
        pending = null;
        reject(new Error('Silent refresh timed out'));
      }
    }, 5000);

    const originalResolve = resolve;
    const originalReject = reject;
    pending.resolve = (token) => {
      clearTimeout(timeout);
      originalResolve(token);
    };
    pending.reject = (err) => {
      clearTimeout(timeout);
      originalReject(err);
    };

    try {
      window.google!.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const reason = notification.isNotDisplayed()
            ? notification.getNotDisplayedReason()
            : notification.getSkippedReason();
          if (pending) {
            const p = pending;
            pending = null;
            p.reject(new Error(`Silent refresh declined: ${reason}`));
          }
        }
      });
    } catch (err) {
      if (pending) {
        pending = null;
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    }
  });
}
