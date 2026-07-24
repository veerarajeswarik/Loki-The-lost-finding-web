/**
 * Consistent API envelope: { success, data, error }.
 */
export const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

export const created = (res, data) => ok(res, data, 201);

export const fail = (res, error, status = 400) =>
  res.status(status).json({ success: false, data: null, error });

/**
 * Application error carrying an HTTP status code.
 */
export class ApiError extends Error {
  constructor(message, status = 400, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
