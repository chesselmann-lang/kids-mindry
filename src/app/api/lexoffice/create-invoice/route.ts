import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createOrUpdateContact, createInvoice } from '@/lib/lexoffice'
import { z } from 'zod'

// POST /api/lexoffice/create-invoice
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()

  if (!['admin'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { paymentItemId, contactEmail, contactName, finalize } = body

  if (!paymentItemId) return NextResponse.json({ error: 'paymentItemId required' }, { status: 400 })

  // Get Lexoffice API key
  const apiKey = process.env.LEXOFFICE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Lexoffice not configured' }, { status: 503 })

  // Load payment item
  const { data: item } = await supabase
    .from('payment_items')
    .select('*')
    .eq('id', paymentItemId)
    .single()

  if (!item) return NextResponse.json({ error: 'Payment item not found' }, { status: 404 })

  // Create or find contact
  const contact = await createOrUpdateContact(apiKey, {
    name: contactName ?? item.title,
    email: contactEmail,
    customerNumber: paymentItemId,
  })

  // Create invoice
  const dueDate = item.due_date ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const invoice = await createInvoice(
    apiKey,
    contact.id,
    [{
      name: item.title,
      quantity: 1,
      unitPrice: (item.amount_cents ?? item.amount) / 100,
      taxRate: 0,
    }],
    dueDate,
    item.description ?? undefined,
    finalize ?? false,
  )

  // Log in DB
  await supabase.from('lexoffice_invoices').insert({
    site_id: (profile as any).site_id,
    payment_item_id: paymentItemId,
    lexoffice_invoice_id: invoice.id,
    contact_id: contact.id,
    finalized: finalize ?? false,
    created_by: user.id,
  })

  return NextResponse.json({ invoiceId: invoice.id, contactId: contact.id, finalized: finalize ?? false })
}
