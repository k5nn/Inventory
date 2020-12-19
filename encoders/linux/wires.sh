#/usr/bin/bash

# http://localhost:8080/insert_item/${name}/${unit}/Paint/${inventory}/${warning}/${retail}/${wholesale}/${capital}

arr_items=( "T.W. Solid #14(1.6mm)"
			"T.W. Solid #12(2.0mm)"
			"T.W. Solid #10(2.6mm)"
			"T.W. Stranded #14/7(2.0mm)"
			"T.W. Stranded #12/7(3.5mm)"
			"T.W. Stranded #10/7(5.5mm)"
			"T.W. Stranded #8/7(8.0mm)"
			"T.W. Stranded #6/7(14.0mm)"
			"T.W. Stranded #4/7(22.0mm)"
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
			"PDX #14/2(1.6mm/2)"
			"PDX #12/2(2.0mm/2)"
			"PDX #10/2(2.6mm/2)"
			"Flat Cord #14/2(2.0mm)"
			"Flat Cord #16/2(1.25mm)"
			"Flat Cord #18/2(0.75mm)"
			"Flat Cord #22/2(0.35mm)"
			"Poly #6/7(14.0mm)"
			"Telephone Wire #22/3(0.35mm/3)"
			"Service Drop #6/7(14.0mm)" )

# m = meter
# r = roll

str_infonotation="m_meter_9999_200_100_100_100|r_roll_200_100_100_100_100"

function clean_name {
	clean_slash=`echo ${1} | sed -e "s/\//%5D/g"`
	clean_space=`echo ${clean_slash} | sed -e "s/~/%20/g"`
	clean_pound=`echo ${clean_space} | sed -e "s/#/%23/g"`
	cleaned_name=${clean_pound}
}

function push_to_db {
	item_stage1=`echo ${1} | sed -e "s/%20/ /g"`
	item_stage2=`echo ${item_stage1} | sed -e "s/%5D/\//g"`
	item_stage3=`echo ${item_stage2} | sed -e "s/%23/#/g"`
	curl -X PUT "http://localhost:8080/insert_item/${1}/${2}/${3}/${4}/${5}/${6}/${7}/${8}"
	echo ${item_stage3}
	# echo "${item_stage3} = http://localhost:8080/insert_item/${1}/${2}/${3}/${4}/${5}/${6}/${7}/${8}"
}

arr_notations=( `echo ${str_infonotation} | tr '\|' '\n'` )

for (( i = 0; i < ${#arr_items[@]}; i++ )); do
	for (( j = 0; j < ${#arr_notations[@]}; j++ )); do
		suffix=`echo ${arr_notations[$j]} | cut -d '_' -f1`
		category="Wires"
		unit=`echo ${arr_notations[$j]} | cut -d '_' -f2`
		inventory=`echo ${arr_notations[$j]} | cut -d '_' -f3`
		warning=`echo ${arr_notations[$j]} | cut -d '_' -f4`
		retail=`echo ${arr_notations[$j]} | cut -d '_' -f5`
		wholesale=`echo ${arr_notations[$j]} | cut -d '_' -f6`
		capital=`echo ${arr_notations[$j]} | cut -d '_' -f7`

		case $suffix in
			'm' )
				append_dirty="${arr_items[$i]} Meter"
				;;
			'r' )
				append_dirty="${arr_items[$i]} Roll"
				;;
		esac

		dirty_name=`echo ${append_dirty} | sed -e 's/ /~/g'`

		clean_name ${dirty_name}

		push_to_db ${cleaned_name} ${unit} "Wires" ${inventory} ${warning} ${retail} ${wholesale} ${capital}


	done
done