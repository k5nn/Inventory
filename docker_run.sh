#!/bin/bash

arr_ids=( `docker ps --all | grep inventory |tr -s ' ' '_' | cut -d '_' -f1` )

for id in ${arr_ids[@]}; do
	docker rm --force $id
done

docker build --tag inventory_1.0 .

docker-compose up
