import montaService from '../services/montaService.js'

// obtener todas las montas
export const getAllmonta = async (req, res) => {
  try {
    const monta = await montaService.getAll()
    res.status(200).json(monta)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// obtener una monta por id
export const getmonta = async (req, res) => {
  try {
    const monta = await montaService.getById(req.params.id)
    res.status(200).json(monta)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

// crear una nueva monta
export const createmonta = async (req, res) => {
  try {
    const monta = await montaService.create(req.body)
    res.status(201).json({ message: 'monta creada', monta })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// actualizar una monta
export const updatemonta = async (req, res) => {
  try {
    await montaService.update(req.params.id, req.body)
    res.status(200).json({ message: 'monta actualizada correctamente' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// eliminar una monta
export const deletemonta = async (req, res) => {
  try {
    await montaService.delete(req.params.id)
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
