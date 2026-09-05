import { apiRequest, unwrapData } from './client';

export async function listConversations() {
    return unwrapData(await apiRequest('conversations')) || [];
}

export async function getConversation(publicId) {
    return unwrapData(await apiRequest(`conversations/${publicId}`));
}

export async function sendConversationMessage(publicId, body) {
    return unwrapData(
        await apiRequest(`conversations/${publicId}/messages`, {
            method: 'POST',
            data: { body },
        }),
    );
}
