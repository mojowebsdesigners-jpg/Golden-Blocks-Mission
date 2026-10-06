import { requireSupabase } from '@/lib/supabase'

export interface ContactPayload {
  full_name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface PartnershipPayload {
  organisation_name?: string
  contact_person: string
  email: string
  phone?: string
  partnership_type: string
  message: string
}

/**
 * Anonymous visitors may INSERT enquiries but never read them back — RLS
 * grants SELECT to administrators only. We therefore insert without
 * `.select()` so no row data is requested.
 */
export async function submitContactMessage(payload: ContactPayload) {
  const sb = requireSupabase()
  const { error } = await sb.from('contact_messages').insert({
    full_name: payload.full_name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim() || null,
    subject: payload.subject.trim(),
    message: payload.message.trim(),
  })
  if (error) throw new Error('We could not send your message right now. Please try again shortly.')
}

export async function submitPartnershipEnquiry(payload: PartnershipPayload) {
  const sb = requireSupabase()
  const { error } = await sb.from('partnership_enquiries').insert({
    organisation_name: payload.organisation_name?.trim() || null,
    contact_person: payload.contact_person.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim() || null,
    partnership_type: payload.partnership_type,
    message: payload.message.trim(),
  })
  if (error) throw new Error('We could not submit your enquiry right now. Please try again shortly.')
}
