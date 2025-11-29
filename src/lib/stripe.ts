import Stripe from 'stripe';

// Use test key if no secret key is provided (for local dev)
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeKey, {
    // @ts-ignore: API version typing issue

    typescript: true,
});

// Helper to check if Stripe is configured (useful for conditional UI)
export const isStripeConfigured = () => {
    return !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder';
};
