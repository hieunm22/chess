setup-env:
	yarn
	git checkout HEAD -- yarn.lock

reset:
	rm -rf dist
	rm -rf node_modules
	rm -rf coverage
	rm -rf src/generated
	rm -f .env.local
	git reset --hard

reset-db:
	npx prisma migrate reset --force
	npx prisma db push

destroy:
	@if docker container inspect chess-api >/dev/null 2>&1; then \
		docker container stop chess-api; \
		docker container rm chess-api; \
		docker image rm chess-api; \
	else \
		echo "Container chess-api does not exist"; \
	fi

docker:
	rm -rf dist
	npx prisma generate
	yarn build
	docker build -t chess-api -f Dockerfile .
	docker run --name chess-api -ditp 5002:8000 --restart unless-stopped --env-file ./.env.local --network chess-network chess-api

publish:
	make destroy
	make docker

start:
	make setup-env
	yarn dev

package:
	yarn
	git checkout HEAD -- yarn.lock
	yarn dev
