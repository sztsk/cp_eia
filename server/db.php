<?php
function dbInfo(){
    $host = $_SERVER['HTTP_HOST'];

    $arr = array(
        'dbhost'=>"localhost",
        'dbuser'=>"root",
        'dbpass'=>"",
        'dbname'=>"db_eic"
    );
    if($host == 'localhost'){
        $arr = array(
            'dbhost'=>"localhost",
            'dbuser'=>"root",
            'dbpass'=>"",
            'dbname'=>"db_eic"
        );
    }else{
        $arr = array(
            'dbhost'=>"localhost",
            'dbuser'=>"hk50bf_eic",
            'dbpass'=>"eiceic",
            'dbname'=>"hk50bf_eic"
        );
    }
    return $arr;
}

?>