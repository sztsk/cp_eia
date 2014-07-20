<?php
/**
 * Step 1: Require the Slim Framework
 *
 * If you are not using Composer, you need to require the
 * Slim Framework and register its PSR-0 autoloader.
 *
 * If you are using Composer, you can skip this step.
 */
require 'Slim/Slim.php';
// Include ezSQL core
include_once "ezSQL/shared/ez_sql_core.php";
// Include ezSQL database specific component
include_once "ezSQL/mysql/ez_sql_mysql.php";

require_once 'tools.php';



\Slim\Slim::registerAutoloader();

/**
 * Step 2: Instantiate a Slim application
 *
 * This example instantiates a Slim application using
 * its default settings. However, you will usually configure
 * your Slim application now by passing an associative array
 * of setting names and values into the application constructor.
 */
$app = new \Slim\Slim();

$app->response->headers->set('Content-Type', 'application/json;charset=utf-8');


$app->post('/product',function(){
    global $app;
    $data = $app->request->post();
    $data['pro_time'] = date('Y-m-d H:i:s');
    $data['pro_user'] = 'admin';
//    var_dump($data);
    $sql = buildSqlInsert('tb_product',$data);
    try {
        $db = getConnection();
        $db->query($sql);
        $data['pro_id'] = $db->insert_id;
        $db = null;
        echo u2utf8(json_encode($data));
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
});

$app->get('/products/cate/:cateid',function($cateid){
    $sql="SELECT * FROM  `tb_product` WHERE pro_status = 1 AND pro_cate = $cateid ORDER BY pro_id DESC";
    try {
        $db = getConnection();
        $data = $db->get_results($sql);
        $db = null;
        echo u2utf8(json_encode($data));
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
});

$app->get('/product/:id',function($id){
    $sql="SELECT * FROM  `tb_product` WHERE pro_id = $id";
    try {
        $db = getConnection();
        $data = $db->get_row($sql);
        $db = null;
        echo u2utf8(json_encode($data));
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
});

$app->put('/product/:id',function($id){
    global $app;
    $data = $app->request->put();
    $sql= buildSqlUpdate('tb_product',$data," pro_id=$id");
    try {
        $db = getConnection();
        $db->query($sql);
        $db = null;
        echo u2utf8(json_encode($data));
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
});

$app->delete('/product/:id',function($id){
    $sql= "UPDATE  `tb_product` SET  `pro_status` =  '0' WHERE  `tb_product`.`pro_id` =$id";
    try {
        $db = getConnection();
        $data = $db->query($sql);
        $db = null;
        echo u2utf8(json_encode($data));
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
});



function createPage(){
    global $app;
    $data = $app->request->post();
    $sql = "";
    try {
        $db = getConnection();
        $data = $db->get_row($sql);
        $db = null;
        echo u2utf8(json_encode($data));
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
}

function updatePageById($id){

};

function getPageById($id) {
    $sql="select * from tb_page where page_state = 1 and page_id=$id";
    //echo $sql;
    try {
        $db = getConnection();
        $data = $db->get_row($sql);
        $db = null;
        echo u2utf8(json_encode($data));
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
}


function getPagesDraft($user = null){
    $where = "";
    if(isset($user)){
        $where = " and page_creator='$user' ";
    }
    $sql="select * from tb_page where  page_theme != 0 and page_template != 0 and page_name IS NOT NULL and page_name !='' and page_state = 1 and page_finish_date is null $where order by page_id desc";
    try {
        $db = getConnection();
        $data = $db->get_results($sql);
        $db = null;
        echo u2utf8(json_encode($data));
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
}

function getPagesByUser($user,$start = 0, $num = 30){
    $sql="select * from tb_page where page_creator='$user' and page_theme != 0 and page_template != 0 and page_name IS NOT NULL and page_name !='' and page_state = 1 and page_finish_date is not null order by page_id desc LIMIT $start , $num";
    try {
        $db = getConnection();
        $data = $db->get_results($sql);
        $db = null;
        echo u2utf8(json_encode($data));
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
}

function deletePageById($id){
    $sql = "UPDATE  `tb_page` SET  `page_state` =  '0' WHERE  `tb_page`.`page_id` = $id";
    try {
        $db = getConnection();
        $data = $db->query($sql);
        echo u2utf8(json_encode($data));
    } catch(PDOException $e) {
        echo '{"error":{"text":"'. $e->getMessage() .'"}}';
    }
}



/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This executes the Slim application
 * and returns the HTTP response to the HTTP client.
 */
$app->run();
