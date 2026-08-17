@extends('layouts.app')

@section('content')

<table class="table">
    <thead>
        <tr>
            <th>ID Elemento</th>
            <th>Código Elemento</th>
            <th>Nº Ubicación</th>
            <th>Código Tipo</th>
            <th>Código Estado</th>
            <th>Marca</th>
        </tr>
    </thead>
    <tbody>
        @foreach($inventarios as $item)
            <tr>
                <td>{{ $item->id_elemento }}</td>
                <td>{{ $item->cod_elemento }}</td>
                <td>{{ $item->No_ubicacion }}</td>
                <td>{{ $item->cod_tipo }}</td>
                <td>{{ $item->cod_estado }}</td>
                <td>{{ $item->marca }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection