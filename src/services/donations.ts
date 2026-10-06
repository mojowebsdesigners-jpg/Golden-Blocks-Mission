import type { DonationFrequency, DonationStatus, PaymentMethod } from '@/types'

export interface DonationRequest {
  amount: number
  currency: 'KES' | 'USD'
  frequency: DonationFrequency
  designation: string
  project_id?: string | null
  payment_method: PaymentMethod
  donor_name: string
  donor_email: string
  donor_phone?: string
  anonymous: boolean
  message?: string
}

export interface DonationInitResponse {
  donation_id: string
  status_token: string
  status: DonationStatus
  /** Card payments: hosted checkout URL to redirect to. */
  authorization_url?: string
  /** Bank transfer: reference the donor must quote. */
  reference?: string
  message?: string
}

async function post<T>(url: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  } catch {
    throw new Error('Network error — please check your connection and try again.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || 'The payment request could not be started.')
  return data as T
}

/** All payment initiation happens server-side; secrets never reach the browser. */
export function startDonation(req: DonationRequest) {
  const path =
    req.payment_method === 'mpesa' ? '/api/donations/mpesa/stk' :
    req.payment_method === 'card' ? '/api/donations/paystack/initialize' :
    '/api/donations/bank'
  return post<DonationInitResponse>(path, req)
}

export interface DonationStatusResponse {
  status: DonationStatus
  amount: number
  currency: string
  payment_method: PaymentMethod
  reference: string | null
  frequency: DonationFrequency
}

export async function getDonationStatus(id: string, token: string): Promise<DonationStatusResponse> {
  const res = await fetch(`/api/donations/status?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Could not check the payment status.')
  return data as DonationStatusResponse
}

export async function verifyCardPayment(reference: string): Promise<DonationStatusResponse & { donation_id: string }> {
  const res = await fetch(`/api/donations/paystack/verify?reference=${encodeURIComponent(reference)}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Could not verify the payment.')
  return data as DonationStatusResponse & { donation_id: string }
}
