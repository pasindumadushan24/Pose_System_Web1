$(document).ready(function(){
    customerManage();

    $("#customer_button").click(function(){
        customerManage();
    });
});

function customerManage(){
    $("#customer_page").show();
    $("#item_page").hide();
    $("#order_detail").hide();
    $("#order_history").hide();
}

$("#item_button").click(function(){
    itemManage();
});

function itemManage(){
    $("#customer_page").hide();
    $("#item_page").show();
    $("#order_detail").hide();
    $("#order_history").hide();
}

$("#order_button").click(function(){
    orderManage();
});

function orderManage(){
    $("#customer_page").hide();
    $("#item_page").hide();
    $("#order_detail").show();
    $("#order_history").hide();
}

$("#order_history_button").click(function(){
    orderHistoryManage();
});

function orderHistoryManage(){
    $("#customer_page").hide();
    $("#item_page").hide();
    $("#order_detail").hide();
    $("#order_history").show();
}





