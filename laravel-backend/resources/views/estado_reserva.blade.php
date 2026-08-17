@extends('layouts.app')

@section('content')

<table class="table">
    <thead>
        <tr>
            <th>Número Estado</th>
            <th>Estado</th>
        </tr>
    </thead>
    <tbody>
        @foreach($estadosReserva as $estado)
            <tr>
                <td>{{ $estado->Num_estado }}</td>
                <td>{{ $estado->estado }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection