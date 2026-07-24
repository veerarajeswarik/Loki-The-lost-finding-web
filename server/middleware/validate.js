/**
 * Validates req[source] against a zod schema and replaces it with the parsed
 * (typed/defaulted) result. Throws ZodError -> handled by errorHandler.
 */
export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const parsed = schema.parse(req[source]);
    req[source] = parsed;
    next();
  };
