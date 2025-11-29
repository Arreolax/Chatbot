<?php
require_once "global.php";

$conexion=new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
mysqli_query($conexion, 'SET NAMES"'.DB_ENCODE.'"');

if(mysqli_connect_error()){
    printf("Fallo la conexion: %s", mysqli_connect_error());
}

if(!function_exists('ejecutarConsulta')){
    function ejecutarConsulta($sql){
        global $conexion;
        $query = $conexion -> query($sql);
        return $query;
    }

    function ejecutarConsultaSecuencial($sql){
        global $conexion;
        $query = $conexion -> multi_query($sql);
        return $query;
    }

    function ejecutarUpdate($sql){
        global $conexion;
        // Por si no llega lo pedido - If inverso
        if(!mysqli_query($conexion, $sql)){
            return("ERROR DE UPDATE: ".mysqli_error($conexion));
        }else{
            return mysqli_affected_rows($conexion);
        }
    }

    function ejecutarConsultaSimpleFila($sql){
        global $conexion;
        $query = $conexion -> query($sql);

        $row = $query -> fetch_assoc();
        return $row;
    }

    function ejecutarConsulta_Id($sql){
        global $conexion;
        $query = $conexion -> query($sql);

        return $conexion -> insert_id;
    }

    function limpiarCadena($str){
        global $conexion;
        $str = mysqli_real_escape_string($conexion, trim($str));    //borra espacios vacios
        return htmlspecialchars($str);
    }
}

?>