import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
import axios from 'axios'

vi.mock('axios')
vi.mock('@/app/lib/notificationsClient', () => ({ useNotifications: () => undefined }))

import CrudProfiles from '../app/dashboard/perfiles/CrudProfiles'

describe('Debugeo — Notificaciones (permiso denegado)', () => {
  const profile = { _id: 'ptest1', name: 'Test User', email: 'test@example.com', password: 'secret', role: 'user', matricula: '', carrera: '', grupo: '', rfids: [], calendarIds: [] }

  let originalNotification: any
  let alertSpy: any

  beforeEach(() => {
    (axios.get as any).mockResolvedValue({ data: [profile] })
    ;(axios.post as any).mockResolvedValue({ status: 200 })

    originalNotification = (global as any).Notification
    class NotificationMock {
      static permission = 'default'
      static async requestPermission() {
        NotificationMock.permission = 'denied'
        return 'denied'
      }
      static instances: any[] = []
      constructor(title: string, opts?: any) {
        ;(NotificationMock.instances as any).push({ title, opts })
      }
    }
    ;(global as any).Notification = NotificationMock
    alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
    ;(global as any).Notification = originalNotification
    alertSpy.mockRestore()
  })

  it('muestra alerta cuando permiso es denegado', async () => {
    render(<CrudProfiles />)

    await waitFor(() => expect(screen.getByText('Test User')).toBeTruthy())

    const debugeoButtons = screen.getAllByText('Debugeo')
    fireEvent.click(debugeoButtons[0])

    await waitFor(() => expect(screen.getByText(/Debugeo — Notificaciones/i)).toBeInTheDocument())

    const probarBtn = screen.getByText('Probar notificación de escritorio')
    fireEvent.click(probarBtn)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('No se pudo mostrar la notificación'))
    })
  })
})
