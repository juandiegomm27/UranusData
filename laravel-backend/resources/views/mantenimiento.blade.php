@extends('layouts.app')

@section('content')

<table class="table">
    <thead>
        <tr>
            <th>Nº Mantenimiento</th>
            <th>ID Elemento</th>
            <th>Código Elemento</th>
            <th>Código Tipo</th>
            <th>Documento</th>
            <th>Descripción</th>
        </tr>
    </thead>
    <tbody>
        @foreach($mantenimientos as $mantenimiento)
            <tr>
                <td>{{ $mantenimiento->No_mantenimiento }}</td>
                <td>{{ $mantenimiento->id_elemento }}</td>
                <td>{{ $mantenimiento->cod_elemento }}</td>
                <td>{{ $mantenimiento->tipo_cod_tipo }}</td>
                <td>{{ $mantenimiento->documento }}</td>
                <td>{{ $mantenimiento->descripcion }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection