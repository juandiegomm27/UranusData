@extends('layouts.app')

@section('content')

<table class="table">
    <thead>
        <tr>
            <th>Código Tipo</th>
            <th>Tipo</th>
        </tr>
    </thead>
    <tbody>
        @foreach($tiposElemento as $tipo)
            <tr>
                <td>{{ $tipo->cod_tipo }}</td>
                <td>{{ $tipo->tipo }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection