const LEXOFFICE_BASE = 'https://api.lexoffice.io/v1'

async function lexFetch(apiKey: string, path: string, options?: RequestInit) {
  const res = await fetch(`${LEXOFFICE_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Lexoffice API ${res.status}: ${text}`)
  return text ? JSON.parse(text) : null
}

export interface LexofficeContact {
  name: string
  email?: string
  phone?: string
  street?: string
  zip?: string
  city?: string
  customerNumber?: string
}

export async function createOrUpdateContact(apiKey: string, contact: LexofficeContact) {
  // Search for existing contact by customer number (childId)
  if (contact.customerNumber) {
    try {
      const searchRes = await lexFetch(
        apiKey,
        `/contacts?customer=true&number=${encodeURIComponent(contact.customerNumber)}`
      )
      if (searchRes?.content?.length > 0) {
        return { id: searchRes.content[0].id, created: false }
      }
    } catch {}
  }

  const payload: any = {
    roles: { customer: {} },
    person: { lastName: contact.name },
    emailAddresses: contact.email
      ? { business: [contact.email] }
      : undefined,
    phoneNumbers: contact.phone
      ? { business: [contact.phone] }
      : undefined,
    addresses: contact.street
      ? {
          billing: [{
            street: contact.street,
            zip: contact.zip ?? '',
            city: contact.city ?? '',
            countryCode: 'DE',
          }]
        }
      : undefined,
    note: contact.customerNumber ? `KitaHub-ID: ${contact.customerNumber}` : undefined,
  }

  // Remove undefined keys
  Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])

  const res = await lexFetch(apiKey, '/contacts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return { id: res.id, created: true }
}

export interface LexofficeInvoiceItem {
  name: string
  quantity: number
  unitPrice: number // gross in EUR
  taxRate: number   // e.g. 0 for tax exempt, 7 or 19
}

export async function createInvoice(
  apiKey: string,
  contactId: string,
  items: LexofficeInvoiceItem[],
  dueDate: string, // YYYY-MM-DD
  note?: string,
  finalize = false,
) {
  const lineItems = items.map(item => ({
    type: 'custom',
    name: item.name,
    quantity: item.quantity,
    unitName: 'Stück',
    unitPrice: {
      currency: 'EUR',
      netAmount: item.taxRate === 0
        ? item.unitPrice
        : +(item.unitPrice / (1 + item.taxRate / 100)).toFixed(2),
      grossAmount: item.unitPrice,
      taxRatePercentage: item.taxRate,
    },
  }))

  const payload = {
    archived: false,
    voucherDate: new Date().toISOString().split('T')[0],
    address: { contactId },
    lineItems,
    totalPrice: { currency: 'EUR' },
    taxConditions: { taxType: items.every(i => i.taxRate === 0) ? 'taxExempt' : 'gross' },
    paymentConditions: {
      paymentTermLabel: `Zahlbar bis ${dueDate}`,
      paymentTermDuration: 14,
    },
    introduction: note ?? 'Vielen Dank für Ihr Vertrauen.',
    remark: 'KitaHub – Automatisch erstellt',
  }

  const res = await lexFetch(apiKey, `/invoices${finalize ? '?finalize=true' : ''}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res
}

export async function sendInvoiceByEmail(apiKey: string, invoiceId: string, recipientEmail: string) {
  return lexFetch(apiKey, `/invoices/${invoiceId}/document`, {
    method: 'GET',
  }).then(() =>
    lexFetch(apiKey, `/invoices/${invoiceId}/send/email`, {
      method: 'POST',
      body: JSON.stringify({
        emailAddress: recipientEmail,
        subject: 'Ihre Rechnung von der Kita',
        body: 'Anbei erhalten Sie Ihre Rechnung als PDF. Bei Fragen kontaktieren Sie uns gerne.',
      }),
    })
  )
}

export async function getLexofficeInvoice(apiKey: string, invoiceId: string) {
  return lexFetch(apiKey, `/invoices/${invoiceId}`)
}

export async function listLexofficeInvoices(apiKey: string) {
  return lexFetch(apiKey, '/invoices?voucherStatus=open,overdue,paid&size=100&page=0&sort=voucherDate,DESC')
}
