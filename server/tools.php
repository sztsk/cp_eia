<?php
include_once 'db.php';

date_default_timezone_set("Asia/Shanghai");

/**
 *  数据库连接 PDO
 */
function getConnection() {
    $dbi = dbInfo();
    $dbhost=$dbi['dbhost'];
    $dbuser=$dbi['dbuser'];
    $dbpass=$dbi['dbpass'];
    $dbname=$dbi['dbname'];
    // at the same time - db_user / db_password / db_name / db_host
    $db = new ezSQL_mysql("$dbuser","$dbpass","$dbname","$dbhost","utf8");
//    mysql_query("set names 'utf8'");
//    $db = new ezSQL_pdo("mysql:host=$dbhost;dbname=$dbname;charset=utf8", $dbuser, $dbpass);
    return $db;
};


/**
 * 拼凑insert sql
 * $data: json 数据
 */
function buildSqlInsert($table, $data)
{
    $key = array_keys($data);
    $val = array_values($data);
    $sql = "INSERT INTO $table (" . implode(', ', $key) . ") "
        . "VALUES ('" . implode("', '", $val) . "')";

    return($sql);
}

/* function to build SQL UPDATE string */
function buildSqlUpdate($table, $data, $where)
{
    $cols = array();
    foreach($data as $key=>$val) {
        $cols[] = "$key = '$val'";
    }
    $sql = "UPDATE $table SET " . implode(', ', $cols) . " WHERE $where";

    return($sql);
}


function u2utf8($str){
    return preg_replace("/\\\u([\da-f]{4})/ie", 'iconv("UCS-2BE","utf-8",pack("H4","\\1"))', $str);
};


//获取用户名
function getSessionUser(){
    $user = '';
    if(isset($_COOKIE['login_user_ecp'])){
        $user = $_COOKIE['login_user_ecp'];
    }
    //return 'hugohua';
    return $user;

}

/**
 * Goofy 2011-11-30
 * getDir()去文件夹列表，getFile()去对应文件夹下面的文件列表,二者的区别在于判断有没有“.”后缀的文件，其他都一样
 */

//获取文件目录列表,该方法返回数组
function getDir($dir) {
    $dirArray[]=NULL;
    if (false != ($handle = opendir ( $dir ))) {
        $i=0;
        while ( false !== ($file = readdir ( $handle )) ) {
            //去掉"“.”、“..”以及带“.xxx”后缀的文件
            if ($file != "." && $file != ".."&&!strpos($file,".")) {
                $dirArray[$i]=$file;
                $i++;
            }
        }
        //关闭句柄
        closedir ( $handle );
    }
    return $dirArray;
}

//获取文件列表
function getFile($dir) {
    $fileArray[]=NULL;
    if (false != ($handle = opendir ( $dir ))) {
        $i=0;
        while ( false !== ($file = readdir ( $handle )) ) {
            //去掉"“.”、“..”以及带“.xxx”后缀的文件
            if ($file != "." && $file != ".."&&strpos($file,".")) {
                $fileArray[$i]= $file;
                if($i==100){
                    break;
                }
                $i++;
            }
        }
        //关闭句柄
        closedir ( $handle );
    }
    return $fileArray;
}

?>