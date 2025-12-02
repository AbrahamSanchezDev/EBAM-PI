import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
import axios from 'axios'

vi.mock('axios')
vi.mock('@/app/lib/notificationsClient', () => ({ useNotifications: () => undefined }))

import CrudProfiles from '../app/dashboard/perfiles/CrudProfiles'

describe('Debugeo — Notificaciones (lookup fallback)', () => {
  const profile = { _id: 'ptest1', name: 'Test User', email: 'test@example.com', password: 'secret', role: 'user', matricula: '', carrera: '', grupo: '', rfids: [], calendarIds: [] }

  beforeEach(() => {
    // first get profiles
    (axios.get as any).mockResolvedValue({ data: [profile] })
    // simulate first post rejects with 404, then lookup returns found canonical email, then second post succeeds
    const postMock = vi.fn()
    postMock
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockResolvedValueOnce({ status: 200 })
    ;(axios.post as any) = postMock
    const getMock = vi.fn()
    // lookup call should return found=true and email canonical@example.com
    getMock.mockImplementation((url: string) => {
      if (url.startsWith('/api/profiles/lookup')) return Promise.resolve({ data: { found: true, email: 'canonical@example.com' } })
      // otherwise profile fetching
      return Promise.resolve({ data: [profile] })
    })
    ;(axios.get as any) = getMock

    // mock Notification so code doesn't throw
    class NotificationMock { static permission = 'granted'; static instances: any[] = []; constructor(title: string, opts?: any) { NotificationMock.instances.push({ title, opts }) } }
    ;(global as any).Notification = NotificationMock
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('cuando primer post falla con 404 usa lookup y vuelve a intentar con email canonical', async () => {
    render(<CrudProfiles />)

    await waitFor(() => expect(screen.getByText('Test User')).toBeTruthy())

    const debugeoButtons = screen.getAllByText('Debugeo')
    fireEvent.click(debugeoButtons[0])

    await waitFor(() => expect(screen.getByText(/Debugeo — Notificaciones/i)).toBeInTheDocument())

    const input = screen.getByPlaceholderText('Texto de notificación') as HTMLInputElement
    const message = 'Fallback lookup test'
    fireEvent.change(input, { target: { value: message } })

    const sendButton = screen.getByText('Enviar')
    fireEvent.click(sendButton)

    await waitFor(() => {
      const calls = (axios.post as any).mock.calls
      // second call should have been made with canonical@example.com
      expect(calls.length).toBeGreaterThanOrEqual(2)
      const secondCall = calls[1]
      expect(secondCall[0]).toBe('/api/notifications')
      expect(secondCall[1].to).toBe('canonical@example.com')
      expect(secondCall[1].message).toBe(message)
    })
  })
})
