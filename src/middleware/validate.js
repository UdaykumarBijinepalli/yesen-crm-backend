import ApiError from '../utils/ApiError.js';

/**
 * validate({ body: joiSchema, query: joiSchema, params: joiSchema })
 * Replaces req[key] with the validated+coerced value on success, so
 * controllers/services always receive clean data.
 */
export default function validate(schemaMap) {
  return (req, res, next) => {
    const keysToValidate = ['body', 'query', 'params'].filter((key) => schemaMap[key]);

    const firstError = keysToValidate.reduce((err, key) => {
      if (err) return err; // already failed on an earlier key, stop validating further ones

      const { error, value } = schemaMap[key].validate(req[key], { abortEarly: false, stripUnknown: true });
      if (error) {
        const details = error.details.map((d) => d.message).join('; ');
        return ApiError.badRequest(`Invalid ${key}: ${details}`);
      }
      req[key] = value;
      return null;
    }, null);

    if (firstError) return next(firstError);
    return next();
  };
}
