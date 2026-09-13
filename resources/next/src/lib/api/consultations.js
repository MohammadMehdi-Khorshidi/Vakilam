import { apiRequest, unwrapData } from './client';

export const getLawyerAvailabilities = async () => unwrapData(await apiRequest('lawyer/availabilities'));
export const createLawyerAvailability = async (payload) => unwrapData(await apiRequest('lawyer/availabilities',{method:'POST',data:payload}));
export const updateLawyerAvailability = async (id,payload) => unwrapData(await apiRequest(`lawyer/availabilities/${encodeURIComponent(id)}`,{method:'PATCH',data:payload}));
export const deleteLawyerAvailability = async (id) => apiRequest(`lawyer/availabilities/${encodeURIComponent(id)}`,{method:'DELETE'});
export const getConsultationRates = async () => unwrapData(await apiRequest('lawyer/consultation-rates'));
export const saveConsultationRates = async (rates) => unwrapData(await apiRequest('lawyer/consultation-rates',{method:'PUT',data:{rates}}));
export const getConsultationDirectory = (legalRequestId, query={}) => apiRequest(`legal-requests/${encodeURIComponent(legalRequestId)}/consultation-directory`,{query});
export const getConsultationSlots = (legalRequestId,lawyerPublicId,duration) => apiRequest(`legal-requests/${encodeURIComponent(legalRequestId)}/consultation-lawyers/${encodeURIComponent(lawyerPublicId)}/slots`,{query:{duration}});
export const createConsultationHold = async (legalRequestId,payload) => unwrapData(await apiRequest(`legal-requests/${encodeURIComponent(legalRequestId)}/consultation-holds`,{method:'POST',data:payload}));
export const getConsultation = async (publicId) => unwrapData(await apiRequest(`consultations/${encodeURIComponent(publicId)}`));
export const cancelConsultationHold = (publicId) => apiRequest(`consultations/${encodeURIComponent(publicId)}/hold`,{method:'DELETE'});
export const prepareConsultationPayment = async (publicId) => unwrapData(await apiRequest(`consultations/${encodeURIComponent(publicId)}/payment-step`,{method:'POST'}));
export const getClientConsultations = async () => unwrapData(await apiRequest('client/consultations'));
export const getLawyerConsultations = async () => unwrapData(await apiRequest('lawyer/consultations'));
