deploy: stop delete pull run

stop:
		docker stop order || echo "Stop ORDER"

delete:
		docker rm order || echo "Delete ORDER"

pull:
		docker pull registry.gitlab.com/fernandocagale/seneca-service-order:latest

run:
		docker run -d \
				--net=host \
				--name order \
				--restart always \
				registry.gitlab.com/fernandocagale/seneca-service-order:latest
