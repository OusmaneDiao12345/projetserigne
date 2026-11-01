export const environment = {
  production: true,
  appName: 'GRF CONSULTING',
  apiBaseUrl: '/api',
  payments: {
    sandbox: true,
    currency: 'XOF',
    successPath: '/paiement/confirmation',
    errorPath: '/paiement/echec'
  }
};
