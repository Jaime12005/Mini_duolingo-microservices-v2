export function createError(message: string, status: number) {
  const error: any = new Error(message);
  error.status = status;
  return error;
}