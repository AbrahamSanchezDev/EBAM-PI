import React from 'react'
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
import axios from 'axios'

vi.mock('axios')
vi.mock('@/app/lib/notificationsClient', () => ({ useNotifications: () => undefined }))

import CrudProfiles from '../app/dashboard/perfiles/CrudProfiles'

describe('Perfiles - Features (editar por usuario)', () => {
  const profileId = 'prof1'
  const baseProfile = {
    _id: profileId,
    name: 'User One',
    email: 'one@example.com',
    password: 'secret',
    role: 'user',
    matricula: '',
    carrera: '',
    grupo: '',
    rfids: [],
    calendarIds: [],
  }

  beforeEach(() => {
    ;(axios.get as any).mockResolvedValue({ data: [baseProfile] })
    ;(axios.put as any).mockResolvedValue({ status: 200 })
    ;(axios.post as any).mockResolvedValue({ status: 201 })
    ;(axios.delete as any).mockResolvedValue({ status: 204 })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('abre modal de features y muestra las opciones disponibles', async () => {
    render(<CrudProfiles />)

    // Esperar a que carguen los perfiles
    await waitFor(() => expect(screen.getByText('User One')).toBeInTheDocument())

    // Pulsar 'Editar Features'
    const editFeaturesButtons = screen.getAllByText('Editar Features')
    fireEvent.click(editFeaturesButtons[0])

    // Debe mostrarse el modal de 'Editar Features' (heading dentro del modal)
    await waitFor(() => expect(screen.getByRole('heading', { name: /Editar Features/i })).toBeInTheDocument())

    // Debe listar al menos una feature conocida (desde app/lib/featureflags)
    // Usamos el texto visible de una feature (por ejemplo 'Calendario')
    const checkbox = await screen.findByLabelText('Calendario') as HTMLInputElement
    expect(checkbox).toBeInTheDocument()
    expect(checkbox.checked).toBe(false)
  })

  it('permite togglear una feature y guarda los cambios (axios.put llamado)', async () => {
    // Profile inicial ya tiene una feature habilitada
    const profWithFeature = { ...baseProfile, features: ['scans'] }
    ;(axios.get as any).mockResolvedValueOnce({ data: [profWithFeature] })

    render(<CrudProfiles />)

    await waitFor(() => expect(screen.getByText('User One')).toBeInTheDocument())

    // Abrir modal de features
    const editFeaturesButtons = screen.getAllByText('Editar Features')
    fireEvent.click(editFeaturesButtons[0])

    await waitFor(() => expect(screen.getByRole('heading', { name: /Editar Features/i })).toBeInTheDocument())

    // El checkbox para 'Registros de Scans' (nombre definido en featureFlags) debería estar marcado
    const scansCheckbox = await screen.findByLabelText('Registros de Scans') as HTMLInputElement
    expect(scansCheckbox.checked).toBe(true)

    // Marcar también 'Calendario'
    const calendarioCheckbox = await screen.findByLabelText('Calendario') as HTMLInputElement
    fireEvent.click(calendarioCheckbox)
    expect(calendarioCheckbox.checked).toBe(true)

    // Pulsar guardar
    const guardarButton = screen.getByText('Guardar')
    fireEvent.click(guardarButton)

    // axios.put debe haberse llamado con la ruta del perfil y el payload de features
    await waitFor(() => expect((axios.put as any).mock.calls.length).toBeGreaterThanOrEqual(1))
    const call = (axios.put as any).mock.calls[0]
    expect(call[0]).toBe(`/api/profiles/${profileId}`)
    expect(call[1]).toEqual(expect.objectContaining({ features: expect.arrayContaining(['scans', 'calendario']) }))
  })
})
