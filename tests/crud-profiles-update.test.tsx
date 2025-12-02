import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
import axios from 'axios'

vi.mock('axios')
vi.mock('@/app/lib/notificationsClient', () => ({ useNotifications: () => undefined }))

import CrudProfiles from '../app/dashboard/perfiles/CrudProfiles'

describe('CRUD Profiles - UPDATE (Actualizar)', () => {
  const profiles = [
    {
      _id: 'prof1',
      name: 'Original Name',
      email: 'original@example.com',
      password: 'secret',
      role: 'user',
      matricula: 'MAT001',
      carrera: 'Ingeniería',
      grupo: 'A',
      rfids: [],
      calendarIds: []
    }
  ]

  beforeEach(() => {
    ;(axios.get as any).mockResolvedValue({ data: profiles })
    ;(axios.put as any).mockResolvedValue({ status: 200 })
    ;(axios.post as any).mockResolvedValue({ status: 201 })
    ;(axios.delete as any).mockResolvedValue({ status: 204 })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('abre modal de edición cuando se pulsa Editar y muestra datos del perfil', async () => {
    render(<CrudProfiles />)

    // Wait for initial load
    await waitFor(() => expect(screen.getByText('Original Name')).toBeInTheDocument())

    // Click "Editar" button for first profile
    const editButtons = screen.getAllByText('Editar')
    fireEvent.click(editButtons[0])

    // Modal should open with form filled with existing data
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Nombre completo') as HTMLInputElement
      expect(input.value).toBe('Original Name')
    })

    // Verify the profile data is loaded in the modal
    const emailInput = screen.getByPlaceholderText('Correo electrónico') as HTMLInputElement
    expect(emailInput.value).toBe('original@example.com')

    const roleSelect = screen.getByDisplayValue('Usuario') as HTMLSelectElement
    expect(roleSelect).toBeTruthy()
  })
})
