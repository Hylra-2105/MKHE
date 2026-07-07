import { createContactApi } from "@/api/contactApi";

export const contactService = {
  createContact: async (contactData) => {
    try {
      const response = await createContactApi(contactData);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
