import { contactApi } from "@/api/contactApi";

export const contactService = {
  createContact: async (contactData) => {
    try {
      const response = await contactApi.createContact(contactData);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
