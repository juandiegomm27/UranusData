<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use Illuminate\Http\Request;

class ReservaController extends Controller
{
    public function index()
    {
        return response()->json(
            Reserva::with('usuario', 'estado', 'prestamo')->get()
        );
    }

    public function show($id)
    {
        $reserva = Reserva::with('usuario', 'estado', 'prestamo')->find($id);
        if (!$reserva) {
            return response()->json(['status' => 'error', 'mensaje' => 'Reserva no encontrada'], 404);
        }
        return response()->json($reserva);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'Num_estado' => 'required|exists:estado_Reserva,Num_estado',
            'documento' => 'required|exists:usuario,documento',
            'fecha' => 'required|date',
            'plazo' => 'nullable|date',
            'cantidad' => 'nullable|integer',
            'elemento' => 'nullable|string'
        ]);

        $reserva = Reserva::create($validated);
        return response()->json(['status' => 'success', 'reserva' => $reserva], 201);
    }

    public function update(Request $request, $id)
    {
        $reserva = Reserva::find($id);
        if (!$reserva) {
            return response()->json(['status' => 'error', 'mensaje' => 'Reserva no encontrada'], 404);
        }

        $reserva->update($request->only(['Num_estado', 'fecha', 'plazo', 'cantidad', 'elemento']));
        return response()->json(['status' => 'success', 'reserva' => $reserva]);
    }

    public function destroy($id)
    {
        $reserva = Reserva::find($id);
        if (!$reserva) {
            return response()->json(['status' => 'error', 'mensaje' => 'Reserva no encontrada'], 404);
        }

        $reserva->delete();
        return response()->json(['status' => 'success', 'mensaje' => 'Reserva eliminada']);
    }
}