<?php
/**
 * User: Rodion Abdurakhimov
 * Mail: rodion@epages.in.ua
 * Date: 11/27/14
 * Time: 13:21
 */

require($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");

$elementId = intval($_REQUEST["ELEMENT_ID"]);
$elementName = $_REQUEST["NAME"];
$arStorages = $_REQUEST["STORAGES"];
$mode = $_REQUEST["MODE"];

if($mode == "BUY")
{
    if(count($arStorages)>0)
    {
        $obStorage = new Epages\CMultiStore($elementId, $elementName, $arStorages);
        $obStorage->addToBasketMultiStorage();
        unset($obStorage);
    }
}

if($mode = "BUILD_TABLE")
{
    global $APPLICATION;
    $arResult = Array();
?>
    <?ob_start()?>
    <?$APPLICATION->IncludeComponent("bitrix:catalog.store.amount", "multi.store.buy", Array(
        "ELEMENT_ID" => $elementId
    ),
    false
    );?>
    <?$arResult["TABLE_BODY"] = ob_get_clean();?>

    <?ob_start()?>
    <div class="modal-footer">
        <a class="btn btn-default btn-buy" data-dismiss="modal" id="multi-storage-buy" data-element-id="<?=$elementId?>">Купить</a>
        <div class="full-summary-price" data-order-sum="0">Сумма: <span>0</span> руб</div>
    </div>
    <?$arResult["TABLE_FOOTER"] = ob_get_clean();?>

    <?
        die(json_encode($arResult));
    ?>
<?
}