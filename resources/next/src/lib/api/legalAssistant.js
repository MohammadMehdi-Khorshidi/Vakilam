import { apiRequest, unwrapData } from './client';

export async function listLegalAssistantMessages() {
    return unwrapData(await apiRequest('ai/legal-assistant/messages')) || [];
}

export async function sendLegalAssistantMessage(message, context = {}) {
    return unwrapData(
        await apiRequest('ai/legal-assistant/messages', {
            method: 'POST',
            data: {
                message,
                ...(context.legalRequestPublicId
                    ? {
                          legal_request_public_id:
                              context.legalRequestPublicId,
                      }
                    : {}),
                ...(context.legalMatterPublicId
                    ? { legal_matter_public_id: context.legalMatterPublicId }
                    : {}),
            },
        }),
    );
}
