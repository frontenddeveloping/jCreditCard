(function($, window, undefined) {

    //you can redefine or extend this object to use your card types
    //card patterns ==> http://en.wikipedia.org/wiki/Bank_card_number
    $.creditCardTypes = {
        visa_electron : {
            pattern: /^(4026|417500|4405|4508|4844|491(3|7))/,
            valid_length: [16]
        },
        visa : {
            pattern: /^4/,
            valid_length: [16]
        },
        mastercard : {
            pattern: /^5[1-5]/,
            valid_length: [16]
        },
        maestro : {
            pattern: /^(5018|5020|5038|5893|6304|6759|676[1-3]|0604)/,
            valid_length: [12, 13, 14, 15, 16, 17, 18, 19]
        }
    };

    var _getCardNames = function(card_types) {
            var accept = [];

            $.each(card_types, function (key) {
                accept.push(key)
            });

            return accept;
        },
        _getCardType = function (userValue, accept, card_types) {
            var cardType;

            $.each(accept, function (index, name){
                cardType = card_types[name];
                if (cardType && cardType.pattern.test(userValue)) {
                    cardType.name = name;
                    //exit each
                    return false;
                } else {
                    cardType = undefined;
                }
            });

            return cardType;
        },
        _checkLuhnSum = function(userValue) {
            var sum = 0,
                numdigits = userValue.length,
                parity = numdigits % 2,
                i = 0,
                digit;

            for(i; i < numdigits; i++) {

                digit = parseInt(userValue.charAt(i));

                if(i % 2 === parity) {
                    digit *= 2;
                }

                if(digit > 9) {
                    digit -= 9;
                }

                sum += digit;
            }

            return (sum % 10) === 0;
        },
        _checkLength = function (userValue, validLength) {
            return $.inArray.call(userValue.length, validLength) > -1;
        },
        _getNormalValue = function (value) {
            return value.replace(/[^\d]+/g, '')
        };

    $.validateCreditCard = function(value, options) {
        var accept,
            card_type,
            card_type_max_length,
            result = {
                card_type : null,
                luhn_valid : false,
                length_valid : false,
                length_too_long : false
            };

        //normalize value
        value = _getNormalValue(value);

        //prevent empty options
        options = options || {};

        //user accept or create accept names from card types
        accept = options.accept || _getCardNames($.creditCardTypes);

        //get card type by value
        card_type = _getCardType(value, accept, $.creditCardTypes);

        if (card_type) {
            card_type_max_length = Math.max.apply(window, card_type.valid_length);
            result = {
                card_type : card_type,
                luhn_valid : _checkLuhnSum(value),
                length_valid : _checkLength(value, card_type.valid_length),
                length_too_long : card_type_max_length < _getNormalValue(value).length
            };
        }

        return result;
    };

    $.fn.validateCreditCard = function(callback, options) {
        var validateCardNumber = function () {

            var $input = $(this),
                value = $input.val(),
                normalValue = _getNormalValue(value),
                result;

            if (normalValue) {
                result = $.validateCreditCard(normalValue, options);
                callback.call($input, result);
            }

        };

        $input.on('keyup', function() {
            validateCardNumber.call(this);
        });

        validateCardNumber();

        return $input;
    };

})(jQuery, window);