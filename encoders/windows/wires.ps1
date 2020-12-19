$arr_items = "T.W. Solid #14(1.6mm)" ,
            "T.W. Solid #12(2.0mm)" ,
            "T.W. Solid #10(2.6mm)" ,
            "T.W. Stranded #14/7(2.0mm)" ,
            "T.W. Stranded #12/7(3.5mm)" ,
            "T.W. Stranded #10/7(5.5mm)" ,
            "T.W. Stranded #8/7(8.0mm)" ,
            "T.W. Stranded #6/7(14.0mm)" ,
            "T.W. Stranded #4/7(22.0mm)" ,
            "Thhn/Thw #14/7(2.0mm) Ordinary"
            "Thhn/Thw #12/7(3.5mm) Ordinary"
            "Thhn/Thw #10/7(5.5mm) Ordinary"
            "Thhn/Thw #8/7(8.0mm) Ordinary"
            "Thhn/Thw #6/7(14.0mm) Ordinary"
            "Thhn/Thw #14/7(2.0mm) P.D."
            "Thhn/Thw #12/7(3.5mm) P.D."
            "Thhn/Thw #10/7(5.5mm) P.D."
            "Thhn/Thw #8/7(8.0mm) P.D."
            "Thhn/Thw #6/7(14.0mm) P.D."
            "PDX #14/2(1.6mm/2)" ,
            "PDX #12/2(2.0mm/2)" ,
            "PDX #10/2(2.6mm/2)" ,
            "Flat Cord #14/2(2.0mm)" ,
            "Flat Cord #16/2(1.25mm)" ,
            "Flat Cord #18/2(0.75mm)" ,
            "Flat Cord #22/2(0.35mm)" ,
            "Poly #6/7(14.0mm)" ,
            "Telephone Wire #22/3(0.35mm/3)" ,
            "Service Drop #6/7(14.0mm)"

# wires legend
#       m = meter
#       r = roll
# wires legend

$str_infonotation = "m_meter_9999_200_100_100_100_-0|r_roll_200_100_100_100_100_-0"

# /insert_item/{item}/{unit}/{category}/{amount}/{warning}/{retail}/{wholesale}/{capital}/{formula}

$arr_notations = $str_infonotation.split( "|" )

for( $i = 0; $i -le ($arr_items.length - 1); $i += 1 ) {
      for( $j = 0; $j -le ($arr_notations.length -1); $j += 1 ) {

            $arr_symbols = $arr_notations[$j].split( "_" )

            Switch( $arr_symbols[0] ) {
                  "m" { $dirty_name = $arr_items[$i] + " 1 Meter" }
                  "r" { $dirty_name = $arr_items[$i] + " 1 Roll" }
            }

            $replace_space = $dirty_name.Replace( " " , "%20" )
            $replace_ffslash = $replace_space.Replace( "/" , "%5D" )
            $replace_singlequote = $replace_ffslash.Replace( "'" , "%27" )
            $replace_pound = $replace_singlequote.Replace( "#" , "%23" )
            $unit = $arr_symbols[1]
            $category = "Wires"
            $amount = $arr_symbols[2]
            $warning = $arr_symbols[3]
            $retail = $arr_symbols[4]
            $wholesale = $arr_symbols[5]
            $capital = $arr_symbols[6]
            $formula = $arr_symbols[7].Replace( "+" , "p" )

            $uri = "http://localhost:8080/insert_item/" + $replace_pound + "/" + $unit + "/" + $category + "/" + $amount + "/" + $warning + "/" + $retail + "/" + $wholesale + "/" + $capital + "/" + $formula

            $uri
    
            # Invoke-WebRequest -uri $uri -Method 'PUT'

      }
}