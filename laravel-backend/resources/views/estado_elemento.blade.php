@extends('layouts.app')

@section('content')

<table class="table">
    <thead>
        <tr>
            <th>Código Estado</th>
            <th>Estado</th>
        </tr>
    </thead>
    <tbody>
        @foreach($estadosElemento as $estado)
            <tr>
                <td>{{ $estado->cod_estado }}</td>
                <td>{{ $estado->estado }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection