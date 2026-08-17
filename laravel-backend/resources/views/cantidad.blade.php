@extends('layouts.app')

@section('content')

<table class="table">
    <thead>
        <tr>
            <th>ID Reserva</th>
            <th>ID Elemento</th>
            <th>Código</th>
        </tr>
    </thead>
    <tbody>
        @foreach($cantidades as $cantidad)
            <tr>
                <td>{{ $cantidad->id_Reserva }}</td>
                <td>{{ $cantidad->id_elemento }}</td>
                <td>{{ $cantidad->codigo }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection