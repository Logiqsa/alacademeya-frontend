export async function retryCourseSaveStep({ key, label, operation, onStatus, onRetryRequired }) {
  for (;;) {
    onStatus?.({ key, label, status: 'running' });
    try {
      return await operation();
    } catch (error) {
      onStatus?.({ key, label, status: 'failed', error });
      if (!onRetryRequired) throw error;
      await new Promise((resolve, reject) => {
        onRetryRequired({ key, error, retry: resolve, cancel: () => reject(error) });
      });
    }
  }
}
