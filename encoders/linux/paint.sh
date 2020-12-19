#/usr/bin/bash

arr_items=( "B-75 Silver Finish" 
			"B-200 Semi-gloss Finish" 
			"B-307 Plasolux Primer Surfacer White" 
			"B-310 Red Oxide Metal Primer" 
			"B-311 Plasolux Glazing Putty White" 
			"B-600 Q.D.E White" 
			"B-621 Q.D.E Ivory" 
			"B-630 Q.D.E Silver Gray" 
			"B-640 Q.D.E Royal Blue" 
			"B-642 Q.D.E Sky Blue" 
			"B-647 Q.D.E Delft Blue" 
			"B-650 Q.D.E Nile Green" 
			"B-651 Q.D.E Dark Green" 
			"B-655 School Board Paint Green" 
			"B-661 Q.D.E Light Yellow" 
			"B-670 Q.D.E Burnt Red" 
			"B-671 International Red" 
			"B-673 Q.D.E Maroon" 
			"B-676 Q.D.E Orange" 
			"B-680 Q.D.E Chocolate Brown" 
			"B-681 Q.D.E Mahogany" 
			"B-690 Q.D.E Black" 
			"B-700 Clear Gloss Acrylic Emulsion" 
			"B-701 Permacoat Latex White" 
			"B-710 Permacoat Gloss Latex White" 
			"B-715 Permacoat Semi-gloss Latex White" 
			"B-771 Permacoat Latex Tile Red" 
			"B-800 Flat Wall Enamel White" 
			"B-1205 Lacquer Flo" 
			"B-1250 Clear Gloss Lacquer" 
			"B-1253 Clear Dead Flat Lacquer" 
			"B-1254 Sanding Sealer" 
			"B-1404 Latex Thalo Blue" 
			"B-1405 Latex Thalo Green" 
			"B-1406 Latex Raw Sienna" 
			"B-1407 Latex Thalo Red" 
			"B-1408 Latex Burnt Sienna" 
			"B-1409 Latex Burnt Umber" 
			"B-1466 Latex Hansa Yellow" 
			"B-1477 Latex Venetian Red" 
			"B-1490 Latex Lamp Black" 
			"B-1705 Acrytex Primer" 
			"B-1711 Acrytex Cast" 
			"B-1750 Acrytex Reducer" 
			"B-2303 Tinting Thalo Green" 
			"B-2306 Tinting Thalo Blue"
			"B-2304 Tinting Prussian Blue" 
			"B-2307 Tinting Yellow Ochre" 
			"B-2311 Tinting Burnt Umber" 
			"B-2313 Tinting Burnt Sienna" 
			"B-2314 Tinting Raw Sienna" 
			"B-2315 Tinting Burnt Red" 
			"B-2317 Tinting Venetian Red" 
			"B-2318 Tinting Lamp Black" 
			"B-2319 Tinting Hansa Yellow" 
			"B-2501 Roofguard Laguna White" 
			"B-2520 Roofguard Samar Beige" 
			"B-2540 Roofguard Pacific Blue" 
			"B-2550 Roofguard Baguio Green" 
			"B-2560 Roofguard Orient Gold" 
			"B-2570 Roofguard Spanish Red" 
			"B-2573 Roofguard Terra Cotta" 
			"B-2700 Oil Wood Stain Walnut" 
			"B-2705 Oil Wood Stain Maple" 
			"B-2707 Oil Wood Stain Mahogany" 
			"B-2708 Oil Wood Stain Oak" 
			"B-2709 Oil Wood Stain Dark Oak" 
			"B-3101 Permatex Textured Latex White" 
			"B-7311 Masonry Putty White" 
			"B-7760 Plexibond Textured Finish" 
			"Hudson PU Sealer" 
			"Hudson PU Topcoat" 
			"Hudson PU Reducer" 
			"Nation Wood Bleach no.1" 
			"Nation Wood Bleach no.2" 
			"NS-10 Masonry Neutralizer" 
			"NS-965 Fast Dry Enamel Maple" 
			"Metal Primer Red Oxide (A-plus)" 
			"Metal Primer Gray Oxide (A-plus)" 
			"Epoxy Primer Red (A-plus)" 
			"Expoy Primer Gray Oxide (A-plus)" )


# code_unit_currentinventory_warningamount_retailprice_wholsaleprice
# /insert_item/{item}/{unit}/{category}/{amount}/{warning}/{retail}/{wholesale}

arr_def=( "l_litre_200_100_160_160_100|g_gallon_200_100_575_575_100" 
			"g_gallon_200_100_534_534_100|t_bucket_200_100_2121_2121_100" 
			"l_litre_200_100_155_155_100|g_gallon_200_100_550_550_100" 
			"l_litre_200_100_110_110_100|g_gallon_200_100_373_373_100" 
			"l_litre_200_100_151_151_100|g_gallon_200_100_542_542_100"  
			"q_quart_200_100_56_56_100|l_litre_200_100_163_163_100|g_gallon_200_100_583_583_100|t_bucket_200_100_2317_2317_100"
			"l_litre_200_100_141_141_100|g_gallon_200_100_492_492_100" 
			"l_litre_200_100_141_141_100|g_gallon_200_100_492_492_100"
			"q_quart_200_100_51_51_100|l_litre_200_100_141_141_100|g_gallon_200_100_494_494_100" 
			"q_quart_200_100_56_56_100|l_litre_200_100_163_163_100|g_gallon_200_100_588_588_100"
			"q_quart_200_100_52_52_100|l_litre_200_100_145_145_100|g_gallon_200_100_514_514_100" 
			"q_quart_200_100_48_48_100|l_litre_200_100_130_130_100|g_gallon_200_100_453_453_100"
			"q_quart_200_100_51_51_100|l_litre_200_100_138_138_100|g_gallon_200_100_481_481_100" 
			"l_litre_200_100_156_156_100|g_gallon_200_100_560_560_100"
			"q_quart_200_100_59_59_100|l_litre_200_100_175_175_100|g_gallon_200_100_632_632_100" 
			"q_quart_200_100_56_56_100|l_litre_200_100_161_161_100|g_gallon_200_100_577_577_100"
			"q_quart_200_100_53_53_100|l_litre_200_100_149_149_100|g_gallon_200_100_532_532_100" 
			"q_quart_200_100_56_56_100|l_litre_200_100_161_161_100|g_gallon_200_100_480_480_100"
			"q_quart_200_100_69_69_100|l_litre_200_100_216_216_100|g_gallon_200_100_807_807_100" 
			"q_quart_200_100_46_46_100|l_litre_200_100_121_121_100|g_gallon_200_100_421_421_100"
			"q_quart_200_100_48_48_100|l_litre_200_100_128_128_100|g_gallon_200_100_444_444_100" 
			"q_quart_200_100_46_46_100|l_litre_200_100_121_121_100|g_gallon_200_100_419_419_100"
			"g_gallon_200_100_555_555_100" 
			"l_litre_200_100_136_136_100|g_gallon_200_100_472_472_100|p_bucket_200_100_1878_1878_100" 
			"l_litre_200_100_157_157_100|g_gallon_200_100_555_555_100|p_bucket_200_100_2210_2210_100" 
			"l_litre_200_100_157_157_100|g_gallon_200_100_555_555_100|p_bucket_200_100_2210_2210_100" 
			"l_litre_200_100_100_100_100|g_gallon_200_100_342_342_100" 
			"l_litre_200_100_150_150_100|g_gallon_200_100_529_529_100|t_bucket_200_100_2101_2101_100" 
			"l_litre_200_100_159_159_100|g_gallon_200_100_579_579_100" 
			"l_litre_200_100_153_153_100|g_gallon_200_100_542_542_100" 
			"l_litre_200_100_154_154_100|g_gallon_200_100_560_560_100" 
			"l_litre_200_100_150_150_100|g_gallon_200_100_530_530_100" 
			"q_quart_200_100_41_41_100|l_litre_200_100_107_107_100" 
			"q_quart_200_100_41_41_100|l_litre_200_100_107_107_100" 
			"q_quart_200_100_41_41_100|l_litre_200_100_107_107_100" 
			"q_quart_200_100_42_42_100|l_litre_200_100_111_111_100" 
			"q_quart_200_100_42_42_100|l_litre_200_100_111_111_100" 
			"q_quart_200_100_45_45_100|l_litre_200_100_117_117_100" 
			"q_quart_200_100_48_48_100|l_litre_200_100_143_143_100" 
			"q_quart_200_100_41_41_100|l_litre_200_100_107_107_100" 
			"q_quart_200_100_36_36_100|l_litre_200_100_89_89_100" 
			"g_gallon_200_100_703_703_100" 
			"g_gallon_200_100_418_418_100" 
			"g_gallon_200_100_368_368_100" 
			"q_quart_200_100_90_90_100" 
			"q_quart_200_100_90_90_100" 
			"q_quart_200_100_63_63_100" 
			"q_quart_200_100_61_61_100" 
			"q_quart_200_100_61_61_100" 
			"q_quart_200_100_67_67_100" 
			"q_quart_200_100_67_67_100" 
			"q_quart_200_100_97_97_100" 
			"q_quart_200_100_68_68_100" 
			"q_quart_200_100_59_59_100" 
			"q_quart_200_100_98_98_100" 
			"g_gallon_200_100_651_651_100" 
			"g_gallon_200_100_560_560_100" 
			"g_gallon_200_100_517_517_100" 
			"g_gallon_200_100_562_562_100" 
			"g_gallon_200_100_547_547_100" 
			"g_gallon_200_100_496_496_100" 
			"g_gallon_200_100_496_496_100" 
			"l_litre_200_100_117_117_100|g_gallon_200_100_402_402_100" 
			"l_litre_200_100_120_120_100|g_gallon_200_100_412_412_100" 
			"l_litre_200_100_120_120_100|g_gallon_200_100_412_412_100" 
			"l_litre_200_100_120_120_100|g_gallon_200_100_412_412_100" 
			"l_litre_200_100_123_123_100|g_gallon_200_100_422_422_100" 
			"g_gallon_200_100_580_580_100" 
			"l_litre_200_100_82_82_100|g_gallon_200_100_275_275_100" 
			"g_gallon_200_100_719_719_100" 
			"g_gallon_200_100_839_839_100" 
			"l_litre_200_100_280_280_100|g_gallon_200_100_1070_1070_100" 
			"l_litre_200_100_154_154_100|g_gallon_200_100_553_553_100" 
			"l_litre_200_100_56_56_100|g_gallon_200_100_170_170_100" 
			"l_litre_200_100_170_170_100|g_gallon_200_100_407_407_100" 
			"l_litre_200_100_55_55_100|g_gallon_200_100_150_150_100" 
			"l_litre_200_100_122_122_100|g_gallon_200_100_429_429_100" 
			"l_litre_200_100_100_100_100|g_gallon_200_100_340_340_100" 
			"l_litre_200_100_100_100_100|g_gallon_200_100_340_340_100" 
			"l_litre_200_100_165_165_100|g_gallon_200_100_570_570_100"
			"l_litre_200_100_165_165_100|g_gallon_200_100_570_570_100" )

for (( i = 0; i < ${#arr_items[@]}; i++ )); do

	arr_code=( `echo ${arr_def[$i]} | tr "|" "\n"` )

	for (( j = 0; j < ${#arr_code[@]}; j++ )); do
		arr_components=( `echo ${arr_code[$j]} | tr "_" "\n"` )

		for (( k = 0; k < ${#arr_components[@]}; k++ )); do
			if [[ $k -eq 0 ]]; then
				clean_name=`echo ${arr_items[$i]} | sed -e "s/ /%20/g"`
				case ${arr_components[$k]} in
					'q' )
						name="${clean_name}%201%5D4"
						;;
					'l' )
						name="${clean_name}%201L"
						;;
					'g' )
						name="${clean_name}%204L"
						;;
					't' )
						name="${clean_name}%2016L%20metal"
						;;
					'p' )
						name="${clean_name}%2016L%20plastic"
						;;
				esac
			elif [[ $k -eq 1 ]]; then
				unit=${arr_components[$k]}
			elif [[ $k -eq 2 ]]; then
				inventory=${arr_components[$k]}
			elif [[ $k -eq 3 ]]; then
				warning=${arr_components[$k]}
			elif [[ $k -eq 4 ]]; then
				retail=${arr_components[$k]}
			elif [[ $k -eq 5 ]]; then
				wholesale=${arr_components[$k]}
			fi

		done
			curl -X PUT http://localhost:8080/insert_item/${name}/${unit}/Paint/${inventory}/${warning}/${retail}/${wholesale}
	done
	echo ${arr_items[$i]}
done
