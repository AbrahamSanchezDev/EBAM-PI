import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
import axios from 'axios'

vi.mock('axios')
vi.mock('@/app/lib/notificationsClient', () => ({ useNotifications: () => undefined }))

import CrudProfiles from '../app/dashboard/perfiles/CrudProfiles'

describe('CRUD Profiles - CREATE (Crear)', () => {
  const existingProfiles = [
    {
      _id: 'prof1',
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'secret',
      role: 'user',
      matricula: 'MAT001',
      carrera: 'Ingeniería',
      grupo: 'A',
      rfids: [],
      calendarIds: []
    }
  ]

  const newProfile = {
    name: 'New User',
    email: 'newuser@example.com',
    password: 'password123',
    role: 'user',
    matricula: 'MAT999',
    carrera: 'Ciencias',
    grupo: 'C',
    rfids: [],
    calendarIds: []
  }

  beforeEach(() => {
    ;(axios.get as any).mockResolvedValue({ data: existingProfiles })
    ;(axios.post as any).mockResolvedValue({ status: 201, data: { ...newProfile, _id: 'prof2' } })
    ;(axios.put as any).mockResolvedValue({ status: 200 })
    ;(axios.delete as any).mockResolvedValue({ status: 204 })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('crea nuevo perfil cuando se llena el formulario y se pulsa Crear', async () => {
    render(<CrudProfiles />)

    // Wait for initial load
    await waitFor(() => expect(screen.getByText('Existing User')).toBeInTheDocument())

    // Click "Crear Perfil" button (the one in the button, not the modal header)
    const createBtns = screen.getAllByText('Crear Perfil')
    fireEvent.click(createBtns[0])

    // Modal should open, fill the form
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Nombre completo') as HTMLInputElement
      expect(input).toBeInTheDocument()
    })

    const inputs = screen.getAllByPlaceholderText(/Nombre completo|Correo electrónico|Contraseña inicial|Matrícula|Carrera|Grupo/)
    
    // Fill name
    fireEvent.change(inputs[0], { target: { value: newProfile.name } })
    // Fill email
    fireEvent.change(inputs[1], { target: { value: newProfile.email } })
    // Fill password
    fireEvent.change(inputs[2], { target: { value: newProfile.password } })
    // Fill matricula
    fireEvent.change(inputs[3], { target: { value: newProfile.matricula } })
    // Fill carrera
    fireEvent.change(inputs[4], { target: { value: newProfile.carrera } })
    // Fill grupo
    fireEvent.change(inputs[5], { target: { value: newProfile.grupo } })

    // Click submit button
    const submitBtn = screen.getByText('Crear')
    fireEvent.click(submitBtn)

    // Verify axios.post was called with correct data
    await waitFor(() => {
      expect((axios.post as any)).toHaveBeenCalledWith('/api/profiles', expect.objectContaining({
        name: newProfile.name,
        email: newProfile.email,
        password: newProfile.password,
        role: 'user',
        matricula: newProfile.matricula,
        carrera: newProfile.carrera,
        grupo: newProfile.grupo
      }))
    })
  })
})
