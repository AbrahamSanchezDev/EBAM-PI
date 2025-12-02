import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
import axios from 'axios'

vi.mock('axios')
vi.mock('@/app/lib/notificationsClient', () => ({ useNotifications: () => undefined }))

import CrudProfiles from '../app/dashboard/perfiles/CrudProfiles'

describe('CRUD Profiles - READ (Consultar)', () => {
  const profiles = [
    {
      _id: 'prof1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret',
      role: 'admin',
      matricula: 'MAT001',
      carrera: 'Ingeniería',
      grupo: 'A',
      rfids: [],
      calendarIds: []
    },
    {
      _id: 'prof2',
      name: 'Jane Smith',
      email: 'jane@example.com',
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
    ;(axios.post as any).mockResolvedValue({ status: 201 })
    ;(axios.put as any).mockResolvedValue({ status: 200 })
    ;(axios.delete as any).mockResolvedValue({ status: 204 })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('carga y muestra lista de perfiles en la tabla', async () => {
    render(<CrudProfiles />)

    // Wait for the component to fetch profiles
    await waitFor(() => {
      expect((axios.get as any)).toHaveBeenCalledWith('/api/profiles')
    })

    // Verify both profiles appear in table
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    // Verify roles are displayed
    const adminElements = screen.getAllByText('admin')
    const userElements = screen.getAllByText('user')
    expect(adminElements.length).toBeGreaterThan(0)
    expect(userElements.length).toBeGreaterThan(0)
  })
})
