import { createClient } from '@/lib/supabase';

export type NotificationType = 'invoice_approved' | 'invoice_rejected' | 'milestone_completed' | 'project_invitation' | 'payment_received' | 'verification_completed';

export interface Notification {
    id?: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    read: boolean;
}

/**
 * Send an in-app notification to a user
 */
export async function sendNotification(notification: Notification) {
    try {
        const supabase = createClient();

        const { error } = await supabase
            .from('notifications')
            .insert([{
                ...notification,
                created_at: new Date().toISOString(),
                read: false,
            }]);

        if (error) {
            console.error('Error saving notification:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
}

/**
 * Send an email notification
 */
export async function sendEmailNotification(
    email: string,
    subject: string,
    templateData: Record<string, any>
) {
    try {
        // This is a placeholder for email service integration
        // You can integrate with SendGrid, Mailgun, AWS SES, etc.
        console.log(`Email notification sent to ${email}:`, {
            subject,
            templateData,
        });

        // For now, just log it
        // In production, you would call your email service provider
        // Example with SendGrid:
        // const sgMail = require('@sendgrid/mail');
        // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        // await sgMail.send({
        //     to: email,
        //     from: process.env.SENDER_EMAIL || 'noreply@admarket.com',
        //     subject,
        //     html: renderEmailTemplate(template, templateData),
        // });

        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

/**
 * Send both in-app and email notifications
 */
export async function notifyUser(
    userId: string,
    userEmail: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
) {
    // Send in-app notification
    await sendNotification({
        user_id: userId,
        type,
        title,
        message,
        data,
        read: false,
    });

    // Send email notification
    await sendEmailNotification(userEmail, title, {
        message,
        ...data,
    });
}

/**
 * Notification templates
 */
export const notificationTemplates = {
    INVOICE_APPROVED: (invoiceNumber: string, amount: number) => ({
        title: 'Invoice Approved',
        message: `Your invoice #${invoiceNumber} for €${amount} has been approved.`,
        type: 'invoice_approved' as NotificationType,
    }),

    INVOICE_REJECTED: (invoiceNumber: string, reason?: string) => ({
        title: 'Invoice Rejected',
        message: `Your invoice #${invoiceNumber} was rejected. ${reason ? `Reason: ${reason}` : ''}`,
        type: 'invoice_rejected' as NotificationType,
    }),

    MILESTONE_COMPLETED: (projectTitle: string, milestoneName: string) => ({
        title: 'Milestone Completed',
        message: `Milestone "${milestoneName}" for project "${projectTitle}" has been marked as completed.`,
        type: 'milestone_completed' as NotificationType,
    }),

    PROJECT_INVITATION: (clientName: string, projectTitle: string) => ({
        title: 'New Project Invitation',
        message: `${clientName} has invited you to work on "${projectTitle}".`,
        type: 'project_invitation' as NotificationType,
    }),

    PAYMENT_RECEIVED: (amount: number, projectTitle: string) => ({
        title: 'Payment Received',
        message: `You received €${amount} payment for "${projectTitle}".`,
        type: 'payment_received' as NotificationType,
    }),

    VERIFICATION_COMPLETED: (status: 'approved' | 'rejected') => ({
        title: 'Verification Result',
        message: status === 'approved'
            ? 'Your identity verification has been approved!'
            : 'Your identity verification was not approved. Please review and resubmit.',
        type: 'verification_completed' as NotificationType,
    }),
};
