@extends('layouts.app')

@section('content')

<table class="table">
    <thead>
        <tr>
            <th>Código Ubicación</th>
            <th>Ubicación</th>
        </tr>
    </thead>
    <tbody>
        @foreach($ubicaciones as $ubicacion)
            <tr>
                <td>{{ $ubicacion->cod_ubicacion }}</td>
                <td>{{ $ubicacion->ubicacion }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection