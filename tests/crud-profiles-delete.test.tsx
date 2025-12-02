import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
import axios from 'axios'

vi.mock('axios')
vi.mock('@/app/lib/notificationsClient', () => ({ useNotifications: () => undefined }))

import CrudProfiles from '../app/dashboard/perfiles/CrudProfiles'

describe('CRUD Profiles - DELETE (Eliminar)', () => {
  const profiles = [
    {
      _id: 'prof1',
      name: 'User to Delete',
      email: 'delete@example.com',
      password: 'secret',
      role: 'user',
      matricula: 'MAT001',
      carrera: 'Ingeniería',
      grupo: 'A',
      rfids: [],
      calendarIds: []
    },
    {
      _id: 'prof2',
      name: 'Remaining User',
      email: 'remaining@example.com',
      password: 'secret',
      role: 'user',
      matricula: 'MAT002',
      carrera: 'Administración',
      grupo: 'B',
      rfids: [],
      calendarIds: []
    }
  ]

  beforeEach(() => {
    ;(axios.get as any).mockResolvedValue({ data: profiles })
    ;(axios.delete as any).mockResolvedValue({ status: 204 })
    ;(axios.post as any).mockResolvedValue({ status: 201 })
    ;(axios.put as any).mockResolvedValue({ status: 200 })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('elimina perfil cuando se pulsa Eliminar', async () => {
    render(<CrudProfiles />)

    // Wait for initial load with both profiles
    await waitFor(() => {
      expect(screen.getByText('User to Delete')).toBeInTheDocument()
      expect(screen.getByText('Remaining User')).toBeInTheDocument()
    })

    // Click first "Eliminar" button
    const deleteButtons = screen.getAllByText('Eliminar')
    expect(deleteButtons.length).toBeGreaterThan(0)
    fireEvent.click(deleteButtons[0])

    // Verify axios.delete was called with correct ID
    await waitFor(() => {
      expect((axios.delete as any)).toHaveBeenCalledWith('/api/profiles/prof1')
    })

    // Verify axios.get is called again to refresh list
    await waitFor(() => {
      const getCalls = (axios.get as any).mock.calls
      expect(getCalls.length).toBeGreaterThan(1)
    })
  })
})
