/**
 * User: Rodion Abdurakhimov
 * Mail: rodion@epages.in.ua
 * Date: 11/27/14
 * Time: 11:45
 */

$(document).ready(function(){
    //снять старые обработчики без многоскладовости на кнопки покупки товара
    $('.quantity #ID_VAL_quant_up, #ID_quant_up').unbind();
    $('.quantity #ID_VAL_quant_down, #ID_quant_down').unbind();
    $('input[name="quantity"]').unbind();
    $(".btn-buy").unbind();

    /**
     * Получает из таблицы склады эелемента, чье количество для покупки было выставлено > 0
     * Возвращает массив объектов jQuery, соответсвтующие строкам таблицы (<tr>), где количество больше 0
     *
     * @returns {*}
     */
    function getElementsToBuy(){
        //получить строки таблицы со складами
        var elements = $("#multi-storage-table tr");
        var result = [];

        //перебрать строки и выделить те, где количество > 0
        elements.each(function(){
            var el = $(this);
            var inputVal = el.find('input[name="quantity"]').val();

            //строки с количеством больше 0 собираются в результирующий массив
            if(parseInt(inputVal)>0)
                result[result.length] = el;
        });

        if(result.length > 0)
            return result; //вернуть массив строк
        else
            return false; //или вернуть false
    }

    /**
     * Отправляет Ajax-запрос на добалвение в корзину товара по складам
     *
     * @param elementId
     * @param elementName
     * @param storageData - объект с инфо о количестве для покупки и ID склада
     */
    function addToBasketByStorage(elementId, elementName, storageData)
    {
        $.ajax({
            type: "POST",
            url: "/ajax/ajax_multi_storage.php",
            data: {
                ELEMENT_ID: parseInt(elementId),
                NAME: elementName,
                STORAGES: storageData,
                MODE: "BUY"
            }
        }).done(function() {
            //после добавления в корзину - обновить малую корзну в шапке сайта
            refreshHeaderCart();
        });
    }

    function initMultiStoreBuy()
    {
        /**
         * Собирает нужные данные по складам для добавления в корзину и передает их функции добавления
         * в коризну - addToBasketByStorage()
         */
        $("#multi-storage-buy").on("click", function(){
            //получить товары, которые надо положить в корзину
            var elements = getElementsToBuy();

            if(elements)
            {
                //Собрать инфо о складе и количестве товара для покупки
                var storageData = {};
                for(var i = 0; i < elements.length; i++)
                {
                    var tr = elements[i];

                    //сложить в объект ID склада и количество товара
                    storageData[i] = {
                        storageId: tr.attr("data-storage-id"),
                        quantity: tr.find('input[name="quantity"]').val()
                    }
                }
            }
            else //если товар не отмечен для покупки ни на одном складе - ничего не делать
                return false;

            //получить ИД товара
            var elementId = $(this).attr("data-element-id");
            //получить имя товара
            var elementName = $(".product_name").text();
            //добавить товар в корзину по складам
            addToBasketByStorage(elementId, elementName, storageData);

            return false;
        });
    }

    function initPlusMinus()
    {
        $('.quantity #ID_VAL_quant_up, #ID_quant_up').click(function () {
            var vl = $(this).prev().val();
            var price = $(this).prev().attr("offer-price");
            var maxQuantity = $(this).prev().attr("offer-max-quantity");
            var i = parseInt(vl);
            var resultQuantity = i;
            if(i < maxQuantity)
            {
                resultQuantity = i + 1;
                $(this).prev().val(resultQuantity);
                $(this).prev().change();
            }
            else
            {
                resultQuantity = i;
                $(this).prev().val(resultQuantity);
                $(this).prev().change();
            }

            recalculateItemPrice(price, resultQuantity, $(this));
        });

        $('.quantity #ID_VAL_quant_down, #ID_quant_down').click(function () {
            var vl = $(this).next().val();
            var price = $(this).next().attr("offer-price");
            var i = parseInt(vl);
            var count = i-1 < 0 ? 0 : i-1;
            $(this).next().val(count);
            $(this).next().change();

            recalculateItemPrice(price, count, $(this));
        });

        $('input[name="quantity"]').on("blur", function(){
            var vl = $(this).val();
            if(isNaN(vl))
                vl = 0;
            var price = $(this).attr("offer-price");
            var maxQuantity = $(this).attr("offer-max-quantity");
            var i = parseInt(vl);
            var resultQuantity = i;
            if(i > maxQuantity)
            {
                resultQuantity = maxQuantity;
                $(this).val(resultQuantity);
                $(this).change();
            }
            else
            {
                resultQuantity = i;
                $(this).val(resultQuantity);
                $(this).change();
            }

            recalculateItemPrice(price, resultQuantity, $(this));
        });
    }

    $('#storeHouses').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        // Extract info from data-* attributes: button.data('name')
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this);
        modal.find(".modal-title").text(button.data('name'));
        $.ajax({
            url: "/ajax/ajax_multi_storage.php",
            dataType: "JSON",
            data: {
                ELEMENT_ID: button.data("id"),
                MODE: "BUILD_TABLE"
            },
            beforeSend: function () {
                modal.find(".modal-table-wrapper").empty();
                modal.find(".bg-danger").addClass("hide");
                modal.find(".loading").removeClass("hide");
            }
        }).done(function (data) {
            modal.find(".loading").addClass("hide");
            modal.find(".modal-table-wrapper").html(data.TABLE_BODY);
            modal.find(".modal-footer").replaceWith(data.TABLE_FOOTER);
            initPlusMinus();
            initMultiStoreBuy();
        });
    });

    //inits
    initPlusMinus();
    initMultiStoreBuy();
});

/**
 * пересчитать цену с учетом количества
 * @param price
 * @param quantity
 * @param obj
 */
function recalculateItemPrice(price, quantity, obj)
{
    var price = parseInt(price);
    var priceResult = number_format(price*quantity, {decimals: 0, thousands_sep: " ", dec_point: ","});

    //
    obj.closest("tr").find(".summary-price span").text(priceResult);

    //обновить сумму заказа внизу таблицы
    recalculateTotalSum();
}

function recalculateTotalSum()
{
    var totalSum = 0;
    $('input[name="quantity"]').each(function(){
        var price = parseInt($(this).attr("offer-price"));
        var quantity = parseInt($(this).val());
        totalSum += price*quantity;
    });

    $(".full-summary-price span").text(number_format(totalSum, {decimals: 0, thousands_sep: " ", dec_point: ","}));
}