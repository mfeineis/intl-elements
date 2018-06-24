module Intl exposing (text)

import Html exposing (Html)
import Html.Attributes as Attr
import Json.Decode as Decode exposing (Value)
import Json.Encode as Encode


encodeIntl : List ( String, Value ) -> String
encodeIntl pairs =
    Encode.encode 0 (Encode.object pairs)


text : String -> Value -> Value -> List (Html.Attribute msg) -> Html msg
text key formats values attrs =
    Html.node "intl-span"
        (attrs
            ++ [ Attr.attribute "intl"
                    (encodeIntl
                        [ ( "key", Encode.string key )
                        , ( "values", values )
                        , ( "formats", formats )
                        ]
                    )
               ]
        )
        []
