module Intl exposing (element, withPlaceholder)

import Html exposing (Html)
import Html.Attributes as Attr
import Json.Decode as Decode exposing (Value)
import Json.Encode as Encode


encodeIntl : List (List ( String, Value )) -> String
encodeIntl list =
    Encode.encode 0 (Encode.list Encode.object list)


element : String -> Value -> Value -> List (Html.Attribute msg) -> Html msg
element key formats values attrs =
    Html.node "intl-element"
        (attrs
            ++ [ Attr.attribute "intl"
                    (encodeIntl
                        [ [ ( "key", Encode.string key )
                          , ( "values", values )
                          , ( "formats", formats )
                          ]
                        ]
                    )
               ]
        )
        []


withPlaceholder : String -> Value -> Value -> Html msg -> Html msg
withPlaceholder key formats values child =
    Html.node "intl-element"
        [ Attr.attribute "intl"
            (encodeIntl
                [ [ ( "key", Encode.string key )
                  , ( "values", values )
                  , ( "formats", formats )
                  , ( "attribute", Encode.string "placeholder" )
                  ]
                ]
            )

        ]
        [ child ]

