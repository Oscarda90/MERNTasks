const Tarea = require('../models/Tarea');
const Proyecto = require('../models/Proyecto');
const { validationResult } = require('express-validator');

//crea una nueva tarea
exports.crearTarea = async (req, res) => { 
	// Revisar si hay errores
	const errores = validationResult(req);
	if(!errores.isEmpty()) {
		return res.status(400).json({
			errores: errores.array()
		});
	}

	try {
		//extraer el proyecto y comprobr si existe
		const { proyecto } = req.body;
		const existeProyecto = await Proyecto.findById(proyecto);

		if(!existeProyecto) {
			return res.status(404).json({msg: 'Proyecto no encontrado'});
		}

		//revisar si el proyecto actual pertenece al usuario autenticado
		if(existeProyecto.creador.toString() !== req.usuario.id ) {
			return res.status(401).json({msg: 'No Autorizado'});
		}

		// Creamos la tarea
		const tarea = new Tarea(req.body);
		//guardamos la tarea
		await tarea.save();
		res.json({ tarea });

	} catch (error) {
		console.log(error);
		res.status(500).send('Hubo en error');
	}

};

// Obtiene las tareas por proyecto
exports.obtenerTareas = async (req, res) => {
	
	//extraemos el proyecto
	//extraer el proyecto y comprobr si existe
	try {
		const { proyecto } = req.query;
		const existeProyecto = await Proyecto.findById(proyecto);

		if(!existeProyecto) {
			return res.status(404).json({msg: 'Proyecto no encontrado'});
		}

		//revisar si el proyecto actual pertenece al usuario autenticado
		if(existeProyecto.creador.toString() !== req.usuario.id ) {
			return res.status(401).json({msg: 'No Autorizado'});
		}

		//obtener las tareas por proyecto
		const tareas = await Tarea.find({ proyecto }).sort({ creado: -1 });
		res.json({ tareas });

	} catch (error) {
		console.log(error);
		res.status(500).send('Hubo un error');
	}
};

//Actualizar una tarea
exports.actualizarTarea = async (req, res) => {
	try {
		//extraer el proyecto y comprobr si existe
		const { proyecto, nombre, estado } = req.body;

		// si la tarea existe o no
		let tarea = await Tarea.findById(req.params.id);
		if (!tarea) {
			return res.status(404).json({msg: 'No existe la tarea'});
		}

		//extraer proyecto
		const existeProyecto = await Proyecto.findById(proyecto);

		//revisar si el proyecto actual pertenece al usuario autenticado
		if(existeProyecto.creador.toString() !== req.usuario.id ) {
			return res.status(401).json({msg: 'No Autorizado'});
		}

		//crear un objeto con la nueva informacion
		const nuevaTarea = {};

		nuevaTarea.nombre = nombre;
		nuevaTarea.estado = estado;


		// Guardar la tarea
		tarea = await Tarea.findByIdAndUpdate({ _id: req.params.id }, nuevaTarea, {new: true});

		res.json({ tarea })

	} catch (error) {
		console.log(error);	
		res.status(500).send('Hubo un error');
	}
};

//Elimina una tarea
exports.eliminarTarea = async (req, res) => { 
	try {
		//extraer el proyecto y comprobr si existe
		const { proyecto } = req.query;

		// si la tarea existe o no
		let tarea = await Tarea.findById(req.params.id);
		if (!tarea) {
			return res.status(404).json({msg: 'No existe la tarea'});
		}

		//extraer proyecto
		const existeProyecto = await Proyecto.findById(proyecto);

		//revisar si el proyecto actual pertenece al usuario autenticado
		if(existeProyecto.creador.toString() !== req.usuario.id ) {
			return res.status(401).json({msg: 'No Autorizado'});
		}

		//eliminar la tarea
		await Tarea.findOneAndRemove({_id: req.params.id });
		res.json({ msg: 'Tarea eliminada'});

	} catch (error) {
		console.log(error);	
		res.status(500).send('Hubo un error');
	}
};