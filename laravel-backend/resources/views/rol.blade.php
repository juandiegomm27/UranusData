@extends('layouts.app')

@section('content')

<table class="table">
    <thead>
        <tr>
            <th>Código Rol</th>
            <th>Cargo</th>
        </tr>
    </thead>
    <tbody>
        @foreach($roles as $rol)
            <tr>
                <td>{{ $rol->cod_rol }}</td>
                <td>{{ $rol->cargo }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

@endsection