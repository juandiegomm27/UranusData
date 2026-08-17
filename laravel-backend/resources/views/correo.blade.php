@extends('layouts.app')

@section('content')

<table class="table">
    <thead>
        <tr>
            <th>Correo</th>
            <th>Documento</th>
        </tr>
    </thead>
    <tbody>
        @foreach($correos as $correo)
            <tr>
                <td>{{ $correo->correo }}</td>
                <td>{{ $correo->documento }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection