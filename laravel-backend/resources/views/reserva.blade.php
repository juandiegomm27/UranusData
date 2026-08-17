@extends('layouts.app')

@section('content')

<table class="table">
    <thead>
        <tr>
            <th>ID Reserva</th>
            <th>Nº Estado</th>
            <th>Documento</th>
            <th>Fecha</th>
            <th>Plazo</th>
            <th>Cantidad</th>
            <th>Elemento</th>
        </tr>
    </thead>
    <tbody>
        @foreach($reservas as $reserva)
            <tr>
                <td>{{ $reserva->id_Reserva }}</td>
                <td>{{ $reserva->Num_estado }}</td>
                <td>{{ $reserva->documento }}</td>
                <td>{{ $reserva->fecha }}</td>
                <td>{{ $reserva->plazo }}</td>
                <td>{{ $reserva->cantidad }}</td>
                <td>{{ $reserva->elemento }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection