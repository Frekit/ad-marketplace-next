import Stripe from 'stripe';

/**
 * Get Stripe client instance lazily
 * This prevents build errors when STRIPE_SECRET_KEY is not available during static analysis
 */
export function getStripeClient() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
        throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    return new Stripe(stripeKey, {
        // @ts-ignore: API version typing issue
        typescript: true,
    });
}

// Helper to check if Stripe is configured (useful for conditional UI)
export const isStripeConfigured = () => {
    return !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder';
};
