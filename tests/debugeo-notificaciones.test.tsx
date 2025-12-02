import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
import axios from 'axios'

vi.mock('axios')
// mock the aliased import used inside the component before importing it
vi.mock('@/app/lib/notificationsClient', () => ({ useNotifications: () => undefined }))

import CrudProfiles from '../app/dashboard/perfiles/CrudProfiles'

describe('Debugeo — Notificaciones (modal)', () => {
  const profile = {
    _id: 'ptest1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'secret',
    role: 'user',
    matricula: '',
    carrera: '',
    grupo: '',
    rfids: [],
    calendarIds: []
  }

  let originalNotification: any

  beforeEach(() => {
    (axios.get as any).mockResolvedValue({ data: [profile] })
    ;(axios.post as any).mockResolvedValue({ status: 200 })

    originalNotification = (global as any).Notification
    class NotificationMock {
      static permission = 'default'
      static async requestPermission() {
        NotificationMock.permission = 'granted'
        return 'granted'
      }
      static instances: any[] = []
      constructor(title: string, opts?: any) {
        ;(NotificationMock.instances as any).push({ title, opts })
      }
    }
    ;(global as any).Notification = NotificationMock
  })

  afterEach(() => {
    vi.clearAllMocks()
    ;(global as any).Notification = originalNotification
  })

  it('muestra notificación de escritorio cuando se pulsa "Probar notificación de escritorio" con permiso', async () => {
    render(<CrudProfiles />)

    await waitFor(() => expect(screen.getByText('Test User')).toBeTruthy())

    const debugeoButtons = screen.getAllByText('Debugeo')
    expect(debugeoButtons.length).toBeGreaterThan(0)
    fireEvent.click(debugeoButtons[0])

    await waitFor(() => expect(screen.getByText(/Debugeo — Notificaciones/i)).toBeInTheDocument())

    const probarBtn = screen.getByText('Probar notificación de escritorio')
    fireEvent.click(probarBtn)

    await waitFor(() => {
      const NotificationMock: any = (global as any).Notification
      expect(NotificationMock.instances.length).toBeGreaterThan(0)
      const last = NotificationMock.instances[NotificationMock.instances.length - 1]
      expect(last.title).toContain('Prueba: Test User')
      expect(last.opts.body).toContain('test@example.com')
    })
  })

  it('envía notificación via API cuando se pulsa "Enviar" en el modal', async () => {
    render(<CrudProfiles />)

    await waitFor(() => expect(screen.getByText('Test User')).toBeTruthy())

    const debugeoButtons = screen.getAllByText('Debugeo')
    fireEvent.click(debugeoButtons[0])

    await waitFor(() => expect(screen.getByText(/Debugeo — Notificaciones/i)).toBeInTheDocument())

    const input = screen.getByPlaceholderText('Texto de notificación') as HTMLInputElement
    const message = 'Hola desde test'
    fireEvent.change(input, { target: { value: message } })

    const sendButton = screen.getByText('Enviar')
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect((axios.post as any)).toHaveBeenCalled()
      const calls = (axios.post as any).mock.calls
      expect(calls.some((c: any) => c[0] === '/api/notifications')).toBe(true)
      const calledWith = calls.find((c: any) => c[0] === '/api/notifications')[1]
      expect(calledWith.to).toBe('test@example.com')
      expect(calledWith.message).toBe(message)
      expect(calledWith.from).toBe('Admin')
    })
  })
})
