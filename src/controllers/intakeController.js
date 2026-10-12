import intakeService from '../services/intakeService.js';

function createIntakeHandler(source) {
  return async function handleIntake(req, res) {
    const inquiry = await intakeService.createFromForm(source, req.body);
    res.status(201).json({ inquiry });
  };
}

export const fromProductForm = createIntakeHandler('product');
export const fromServiceForm = createIntakeHandler('service');
export const fromContactForm = createIntakeHandler('contact');
