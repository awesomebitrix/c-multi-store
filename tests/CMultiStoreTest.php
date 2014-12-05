<?php
/**
 * User: Rodion Abdurakhimov
 * Mail: rodion@epages.in.ua
 * Date: 11/30/14
 * Time: 23:51
 */

class CMultiStoreTest extends PHPUnit_Framework_TestCase
{
    protected $multiStore;

    public function setUp()
    {
        $this->multiStore = new \Epages\CMultiStore();
    }

    public function testGetStorageName()
    {
        $this->assertTrue(strlen($this->multiStore->getStorageName(2))>0, "Ошибка в получении имени склада");
    }

    public function testPrepareEntity()
    {
        $this->assertEquals("\\BasketStoreItemIndexTable", $this->multiStore->prepareEntity(HIGHLOAD_BASKET_STORAGE_INDEX), "Таблица хлблока называется неправильно или отсутствует");
    }

    public function testIsBasketIndexConstantExists()
    {
        $this->assertTrue(
            defined("HIGHLOAD_BASKET_STORAGE_INDEX"),
            "Константа HIGHLOAD_BASKET_STORAGE_INDEX не определена"
        );
    }

    /**
     * @dataProvider basketDataProvider
     * @param $arFields
     */
    public function testOnBeforeBasketAddHandler($arFields)
    {
        $this->assertTrue(
            in_array("CCustomCatalogProductProvider", $this->multiStore->OnBeforeBasketAddHandler($arFields)),
            "Метод не изменят стандартный класс ProductProvider на кастомный при наличии свойства STORAGE_ID корзины");
    }

    public function testGetBasketStorageIndex()
    {
        $this->assertTrue(
            count(
                $this->multiStore->getBasketStorageIndex(
                    Array("*"),
                    Array(),
                    Array("UF_STORE_ID" => "1")
                )
            )>0,
            "Элемент из hl-блока не выбран"
        );
    }

    public function basketDataProvider()
    {
        return Array(
            Array(
                Array(
                    "PROPS" => Array(
                        Array("CODE" => "STORAGE_ID")
                    ),
                    "PRODUCT_PROVIDER_CLASS" => "CCatalogProductProvider"
                )
            )
        );
    }

    public function testIsModulesIncluded()
    {
        $this->assertTrue(IsModuleInstalled('highloadblock'), 'Модуль highloadblock не установлен.');
        $this->assertTrue(IsModuleInstalled('sale'), 'Модуль sale не установлен.');
        $this->assertTrue(IsModuleInstalled('catalog'), 'Модуль catalog не установлен.');
    }

    public function tearDown()
    {
        unset($this->multiStore);
    }
}