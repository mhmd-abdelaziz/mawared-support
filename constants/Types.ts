enum MessageSender {
  SAAS = "saas",
  Contact = "contact",
}

enum MessageStatus {
  SENT = "sent",
  READ = "read",
  FAILED = "failed",
  PENDING = "pending",
  DELIVERED = "delivered",
}

export interface Message {
  id: string;
  name: string;
  content: string;
  saas_id: string;
  media_url: string;
  created_time: string;
  w_message_id: string;
  sender: MessageSender;
  status: MessageStatus;
  temp_message_id: string;
  message_parent_id: string;
  company_contact_id: string;
}
