@extends('layouts.app')

@section('content')

<table class="table">
    <thead>
        <tr>
            <th>Teléfono</th>
            <th>Documento</th>
        </tr>
    </thead>
    <tbody>
        @foreach($telefonos as $telefono)
            <tr>
                <td>{{ $telefono->telefono }}</td>
                <td>{{ $telefono->documento }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection