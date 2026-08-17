@extends('layouts.app')

@section('content')

<table class="table">
    <thead>
        <tr>
            <th>ID Reserva</th>
            <th>Fecha Inicio</th>
            <th>Fecha Entrega</th>
            <th>Cantidad</th>
        </tr>
    </thead>
    <tbody>
        @foreach($prestamos as $prestamo)
            <tr>
                <td>{{ $prestamo->id_Reserva }}</td>
                <td>{{ $prestamo->fecha_inicio }}</td>
                <td>{{ $prestamo->fecha_entrega }}</td>
                <td>{{ $prestamo->cantidad }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection